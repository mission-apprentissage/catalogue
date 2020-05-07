const { connectToMongo } = require("../../../../common/mongo");
const { Formation } = require("../../../common-jobs/models");
const logger = require("../../../common-jobs/Logger").mainLogger;
const asyncForEach = require("../../../common-jobs/utils").asyncForEach;
const pSupData = require("./updaters/pSupData");

const UPDATE_ALL = true;
const UPDATE_ONLY = { attr: "ds_id_dossier", value: "1202774" };

const run = async () => {
  try {
    logger.info(" -- Start of Trainings updater -- ");
    await connectToMongo();

    const trainings = await Formation.find({ parcoursup_reference: "NON" }).and([
      { educ_nat_code: { $ne: null } },
      { educ_nat_code: { $ne: "" } },
      { intitule_long: { $ne: null } },
      { intitule_long: { $ne: "" } },
      { intitule_court: { $ne: null } },
      { intitule_court: { $ne: "" } },
      { niveau: { $ne: null } },
      { niveau: { $ne: "" } },
    ]);

    console.log(trainings.length);
    const formationToload = trainings.filter(trainingItem => {
      if (
        //trainingItem._doc.niveau === "4 (Bac...)" ||
        trainingItem._doc.niveau === "5 (BTS, DUT...)" ||
        trainingItem._doc.niveau === "6 (Licence...)"
      ) {
        if (
          trainingItem._doc.etablissement_formateur_uai !== null ||
          trainingItem._doc.etablissement_responsable_uai !== null ||
          trainingItem._doc.uai_formation !== null
        ) {
          if (
            trainingItem._doc.etablissement_formateur_conventionne === "OUI" ||
            (trainingItem._doc.etablissement_reference_declare_prefecture === "OUI" &&
              trainingItem._doc.etablissement_reference_datadock === "datadocké")
          ) {
            // GROUPE 1  ON EST QUE CES FORMATIONS ENTRENT
            return true;
          } else if (
            trainingItem._doc.rncp_eligible_apprentissage &&
            (trainingItem._doc.rncp_etablissement_formateur_habilite ||
              trainingItem._doc.rncp_etablissement_responsable_habilite)
          ) {
            // CHECK RNCP
            return true;
          }
        }
      }

      return false;
    });
    console.log(formationToload.length);

    await asyncForEach(formationToload, async trainingItem => {
      if (UPDATE_ALL || trainingItem._doc[UPDATE_ONLY.attr] === UPDATE_ONLY.value) {
        let updatedTraining = {
          ...trainingItem._doc,
        };
        let updatedNeeded = false;

        // Update PSup
        const updatesPSupData = await pSupData.getUpdates(updatedTraining);
        if (updatesPSupData) {
          updatedTraining = {
            ...updatedTraining,
            ...updatesPSupData,
          };
          updatedNeeded = true;
        }

        // Update training
        // if (updatedNeeded) {
        //   updatedTraining.last_update_at = Date.now();
        //   try {
        //     await Formation.findOneAndUpdate({ _id: trainingItem._id }, updatedTraining, { new: true });
        //     logger.info(`Training ${trainingItem._id} has been updated`);
        //   } catch (error) {
        //     logger.error(error);
        //   }
        // } else {
        //   logger.info(`Training ${trainingItem._id} nothing to do`);
        // }
      }
    });
    pSupData.stats();

    logger.info(" -- End of Trainings updater -- ");
  } catch (err) {
    logger.error(err);
  }
};

run();
