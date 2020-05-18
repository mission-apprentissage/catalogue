// #region Imports
const { connectToMongo, closeMongoConnection } = require("../../../../../common/mongo");
const logger = require("../../../../common-jobs/Logger").mainLogger;
//const asyncForEach = require("../../../../common/utils").asyncForEach;
const { uniq, remove } = require("lodash");
const fs = require("fs-extra");
//const stringSimilarity = require("string-similarity");
//const { detailedDiff } = require("deep-object-diff");
const cluster = require("cluster");

const { Formation } = require("../../../../common-jobs/models");

// const pressAnyKey = () =>
//   new Promise(resolve => {
//     console.log("Press enter to continue.");
//     process.stdin.once("data", () => {
//       resolve();
//     });
//   });

const NB_THREAD = 64;
const attrToCompare = [
  "etablissement_formateur_siret",
  "etablissement_responsable_siret",
  "diplome",
  "intitule",
  "educ_nat_code", // 8 char mandatory
  "niveau",
  "uai_formation", // mandatory
  "code_postal", // mandatory
  "mef_10_code",
];
// etablissement_formateur_uai
// etablissement_responsable_uai
// code_commune_insee
// nom?
// source privilege DS

const findDuplicate = (lookUp, trainings) => {
  const statistics = {
    similare: 0,
    exact: 0,
    total: 0,
  };
  const duplicates = new Map();

  const tmpById = new Map();
  trainings.forEach(f => tmpById.set(`${f._id}`, true));

  while (lookUp.length > 0) {
    const currentTraining = lookUp.pop();
    if (tmpById.get(currentTraining._id)) {
      tmpById.delete(currentTraining._id);

      for (let i = 0; i < trainings.length; i++) {
        const training = trainings[i];
        if (currentTraining._id !== training._id) {
          let countMatch = [0, 0];

          // Calcul of matchPercentage
          for (let i = 0; i < attrToCompare.length; i++) {
            const key = attrToCompare[i];
            countMatch[1]++; // total count

            if (currentTraining[key] && training[key] && currentTraining[key] === training[key]) {
              countMatch[0]++; // match count
            }
          }
          const matchPercentage = countMatch[0] / countMatch[1]; // Percentage of match

          if (matchPercentage === 1) {
            let duplicate = duplicates.get(currentTraining._id);
            if (!duplicate) {
              duplicates.set(currentTraining._id, []);
              duplicate = [];
            }
            duplicates.set(currentTraining._id, [...duplicate, training._id]);

            tmpById.delete(training._id);
            statistics.exact++;
          }
        }
      }
    }
  }

  return {
    statistics,
    duplicates,
  };
};

/**
 * Returns an array with arrays of the given size.
 *
 * @param myArray {Array} array to split
 * @param chunk_size {Integer} Size of every group
 */
const chunkArray = (myArray, chunk_size) => {
  let index = 0;
  const arrayLength = myArray.length;
  const tempArray = [];

  for (index = 0; index < arrayLength; index += chunk_size) {
    const myChunk = myArray.slice(index, index + chunk_size);
    // Do something if you want with the group
    tempArray.push(myChunk);
  }

  return tempArray;
};

let workers = {};
const areAllWorkersTerminated = () => {
  let status = true;
  for (const property in workers) {
    if (!workers[property].terminated) {
      status = false;
    }
  }
  return status;
};

const workersLifecycle = jobs =>
  new Promise(resolve => {
    const duplicatess = new Map();

    cluster.on("online", function(worker) {
      worker.send({
        type: "job",
        from: "master",
        data: jobs[worker.process.pid],
      });

      worker.on("message", async function({ pid }) {
        //console.log(`Worker ${pid} terminated`);
        workers[pid].terminated = true;

        const duplicatesArray = await fs.readJson(`./tmp/duplicates_${pid}.json`);

        const workerDuplicates = new Map(duplicatesArray);

        //Merge
        for (const [cid, ids] of workerDuplicates) {
          let duplicates = duplicatess.get(cid);
          if (!duplicates) {
            duplicatess.set(cid, ids);
          } else {
            duplicatess.set(cid, uniq([...duplicates, ...ids]));
          }
        }

        if (areAllWorkersTerminated()) {
          console.log(`Workers terminated`);
          resolve(duplicatess);
        }
      });
    });
  });

const mergeDuplicates = duplicatesToMerge => {
  const duplicatesMerge = new Map();
  for (const [id, ids] of duplicatesToMerge) {
    if (duplicatesMerge.size === 0) {
      duplicatesMerge.set(id, ids);
      //firstIds = ids;
    } else {
      let alreadyExist = null;
      for (let i = 0; i < ids.length; i++) {
        const cId = ids[i];
        if (duplicatesMerge.has(cId)) {
          alreadyExist = cId;
        }
      }
      if (alreadyExist) {
        const previousIds = duplicatesMerge.get(alreadyExist);
        const idsToAdd = remove(ids, n => n !== alreadyExist);
        duplicatesMerge.set(alreadyExist, uniq([...previousIds, id, ...idsToAdd]));
      } else {
        duplicatesMerge.set(id, ids);
      }
    }
  }
  return duplicatesMerge;
};

const run = async () => {
  try {
    if (cluster.isMaster) {
      logger.info(" -- Start Duplicate handler matser thread -- ");
      await fs.ensureDir(`./tmp`);

      await connectToMongo();

      let trainings = await Formation.find({});

      const trainingsById = new Map();

      // Just the attrs we need to test eg light weight training model
      trainings = trainings.map(f => {
        let item = { _id: `${f._id}` };
        trainingsById.set(`${f._id}`, {
          ...f._doc,
          _id: null,
          created_at: null,
          last_update_at: null,
        });
        for (let i = 0; i < attrToCompare.length; i++) {
          const key = attrToCompare[i];
          item[key] = f[key];
        }
        return item;
      });

      const lookUp = [...trainings];

      const splitLimit = Math.floor(lookUp.length / NB_THREAD) + 1;
      const lookUpChunks = chunkArray(lookUp, splitLimit);

      let jobs = {};
      for (let i = 0; i < NB_THREAD; i++) {
        const worker = cluster.fork();
        jobs[worker.process.pid] = { lookUp: lookUpChunks.pop(), trainings };
        workers[worker.process.pid] = { terminated: false };
      }

      const resultsWorkers = await workersLifecycle(jobs);

      const duplicates = mergeDuplicates(resultsWorkers);

      await fs.remove("./tmp");

      // console.log(duplicates.size);
      // let count = 0;
      // for (const ids of duplicates.values()) {
      //   if (ids.length > 1) count += ids.length - 1;
      // }
      // console.log(count + duplicates.size);

      const exportDuplicateIds = [];
      for (const [cid, ids] of duplicates) {
        // const currentTraining = trainingsById.get(cid);
        // for (let i = 0; i < ids.length; i++) {
        //   const id = ids[i];
        //   const training = trainingsById.get(id);
        //   console.log(detailedDiff(currentTraining, training).updated);
        // }
        exportDuplicateIds.push([cid, ...ids]);
      }
      console.log(exportDuplicateIds.length);

      await fs.writeJson(`./duplicates.json`, exportDuplicateIds);

      closeMongoConnection();
      logger.info(" -- end Duplicate handler master thread -- ");
    } else {
      process.on("message", async message => {
        //console.log(`Worker ${process.pid} starts`);
        const { lookUp, trainings } = message.data;

        const { statistics, duplicates } = findDuplicate(lookUp, trainings);

        await fs.writeJson(`./tmp/duplicates_${process.pid}.json`, Array.from(duplicates));

        process.send({ pid: process.pid, statistics });

        // eslint-disable-next-line no-process-exit
        process.exit(0);
      });
    }
    //const { statistics, duplicates } = findDuplicate(lookUp, trainings);
    //console.log(duplicates.size);
  } catch (err) {
    logger.error(err);
  }
};

run();

// /**
//  * Get the matching percentage for considering double for a given numAcademie
//  */
// const getMatchPercentageForNumAcademie = (numAcademie, idDossier) => {
//   try {
//     // Strategy defined in mappingConstants.specificMatchPercentage
//     if (numAcademie == mappingConstants.specificMatchPercentage.numAcademie)
//       return mappingConstants.specificMatchPercentage.percentage;
//     return 0.9; // Strategy 90% is considered as the same object for all others numAcademie
//   } catch (err) {
//     log.dsFileStrategyRemoveDoubleLogger(idDossier).error(`getMatchPercentageForNumAcademie >>> Error ${err}`);
//     return 0.9;
//   }
// };

// const specificMatchPercentage = {
//   numAcademie: "32",
//   percentage: 0.98,
// };

// const strategyRemoveDouble = (catalogue, id = 0, takeMissingTrainingsMode = false) => {
//   let formationsDoublons = [];
//   const keysFormation = [
//     "siret_CFA_OFA",
//     "siret_formateur",
//     "siren",
//     "nom", // NOPE
//     "diplome",
//     "intitule",
//     "codeEducNat",
//     "niveau", // Normalement oui
//     "periode", // NOPE
//     "capacite", // NOPE
//     "email",
//     "uai",
//     "codePostal",
//   ];

//   const countObjects = {
//     similare: 0,

//     exact: 0,
//     total: 0,
//   };

//   const countSimilareObjects = {
//     verifiedDoublon: 0,
//     notVerifiedDoublon: 0,
//   };

//   const formationsWithoutDoublons = uniqWith(catalogue, (a, b) => {
//     let countMatch = [0, 0];

//     // Get match percentage depending on numAcademie
//     const matchPercentageStrategyForAcademie = getMatchPercentageForNumAcademie(a["numAcademie"], id);

//     // Calcul of matchPercentage
//     for (let i = 0; i < keysFormation.length; i++) {
//       const key = keysFormation[i];
//       countMatch[1]++; // total count

//       if (a[key] === b[key]) {
//         countMatch[0]++; // match count
//       } else if (
//         // handwriting, special characters correction ! if string are almost the same, 87% of match => it's an equality
//         (key === "nom" || key === "intitule") &&
//         a[key] !== null &&
//         b[key] !== null &&
//         stringSimilarity.compareTwoStrings(a[key], b[key]) > 0.87
//       ) {
//         countMatch[0]++; // match count
//       }
//     }
//     const matchPercentage = countMatch[0] / countMatch[1]; // Percentage of match

//     if (matchPercentage >= matchPercentageStrategyForAcademie && matchPercentage <= 1) {
//       logger.info(`strategyRemoveDouble >>> Duplicate found : ${JSON.stringify(a)} vs ${JSON.stringify(b)}`);
//       countObjects.total++;
//       if (matchPercentage === 1) {
//         logger.info(`strategyRemoveDouble >>> matchPercentage = 1`);
//         countObjects.exact++;
//       } else {
//         logger.info(`strategyRemoveDouble >>> Semi equality - Check in DoublonsVerifies file before adding a doublon`);
//         countObjects.similare++;
//         if (!dsChecker.isFormationInDoublonsFile(b)) {
//           // ALREADY EXIST IN TAGS DUPLICATE
//           // Formation not in DoublonsVerifies, add as a real doublon to check
//           logger.info(`strategyRemoveDouble >>> Formation not in DoublonsVerifies file, add as a doublon in worksheet`);
//           logger.info(JSON.stringify(b));

//           countSimilareObjects.notVerifiedDoublon++;
//           formationsDoublons.push(b); // Asumption 'a' is kept and b is filtered out
//         } else {
//           // Formation in DoublonsVerifies remove it from catalogue
//           logger.info(
//             `strategyRemoveDouble >>> Formation found in DoublonsVerifies file, add it as a verifiedDoublons`
//           );
//           countSimilareObjects.verifiedDoublon++;
//         }
//       }
//     }

//     return matchPercentage >= matchPercentageStrategyForAcademie;
//   });

//   if (
//     catalogue.length !== formationsWithoutDoublons.length + formationsDoublons.length + countObjects.exact &&
//     countObjects.similare != countSimilareObjects.verifiedDoublon + countSimilareObjects.notVerifiedDoublon
//   ) {
//     logger.error(`strategyRemoveDouble >>> Strategy failed !`);
//   }

//   return {
//     result: formationsWithoutDoublons,
//     doublons: formationsDoublons,
//     countObjects,
//   };
// };
