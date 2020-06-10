const { connectToMongo } = require("../../../../../common/mongo");
const { Formation } = require("../../../../common-jobs/models");
const logger = require("../../../../common-jobs/Logger").mainLogger;
const asyncForEach = require("../../../../common-jobs/utils").asyncForEach;
const establishmentsData = require("./updaters/establishmentsData");
const codeEnData = require("./updaters/codeEnData");
const locationData = require("./updaters/locationData");
const academieData = require("./updaters/academieData");
const bcnData = require("./updaters/bcnData");
const pSupData = require("./updaters/pSupData");
const affelnetData = require("./updaters/affelnetData");
const publishedData = require("./updaters/publishedData");

const run = async (updateOnly = null) => {
  try {
    logger.info(" -- Start of Trainings updater -- ");
    await connectToMongo();

    const filter = !updateOnly ? {} : updateOnly;

    const trainings = await Formation.find(filter);

    await asyncForEach(trainings, async trainingItem => {
      let updatedTraining = {
        ...trainingItem._doc,
      };
      let updatedNeeded = false;

      // Fix / Clean CodeEn
      const updatesCodeEnData = codeEnData.getUpdates(updatedTraining);
      if (updatesCodeEnData) {
        updatedTraining = {
          ...updatedTraining,
          ...updatesCodeEnData,
        };
        updatedNeeded = true;
      }

      // Update Establishments information
      const updatesEstablishmentsData = await establishmentsData.getUpdates(updatedTraining);
      if (updatesEstablishmentsData) {
        updatedTraining = {
          ...updatedTraining,
          ...updatesEstablishmentsData,
        };
        updatedNeeded = true;
      }

      // Update location information
      const updatesLocationData = locationData.getUpdates(updatedTraining);
      if (updatesLocationData) {
        updatedTraining = {
          ...updatedTraining,
          ...updatesLocationData,
        };
        updatedNeeded = true;
      }

      // Update academie information
      const updatesAcademieData = await academieData.getUpdates(updatedTraining);
      if (updatesAcademieData) {
        updatedTraining = {
          ...updatedTraining,
          ...updatesAcademieData,
        };
        updatedNeeded = true;
      }

      // Update BCN > codeEn,niveau, intitule court & long, diplome information, codeMEF, Modalité + get multi mef10 trainings
      const { updatedTraining: updatesBcnData, trainingsToCreate } = await bcnData.getUpdates(updatedTraining);
      if (updatesBcnData) {
        updatedTraining = {
          ...updatedTraining,
          ...updatesBcnData,
        };
        updatedNeeded = true;
      }

      // Update PSup
      const updatesPSupData = await pSupData.getUpdates(updatedTraining);
      if (updatesPSupData) {
        updatedTraining = {
          ...updatedTraining,
          ...updatesPSupData,
        };
        updatedNeeded = true;
      }

      // Update Affelnet
      const updatesAffelnetData = await affelnetData.getUpdates(updatedTraining);
      if (updatesAffelnetData) {
        updatedTraining = {
          ...updatedTraining,
          ...updatesAffelnetData,
        };
        updatedNeeded = true;
      }

      const updatesPublishedData = await publishedData.getUpdates(updatedTraining);
      if (updatesPublishedData) {
        updatedTraining = {
          ...updatedTraining,
          ...updatesPublishedData,
        };
        updatedNeeded = true;
      }

      delete updatedTraining.etablissement_responsable_siret_intitule;
      delete updatedTraining.etablissement_formateur_siret_intitule;
      // suppression des anciens champs de localisation
      delete updatedTraining.etablissement_reference_localisation_coordonnees_lon;
      delete updatedTraining.etablissement_reference_localisation_coordonnees_lat;
      delete updatedTraining.etablissement_reference_localisation_geojson;

      // Update training
      if (updatedNeeded) {
        updatedTraining.last_update_at = Date.now();
        try {
          await Formation.findOneAndUpdate({ _id: trainingItem._id }, updatedTraining, { new: true });
          logger.info(`Training ${trainingItem._id} has been updated`);

          // Add trainings
          await asyncForEach(trainingsToCreate, async trainingToAdd => {
            delete trainingToAdd._id;
            const doc = new Formation(trainingToAdd);
            await doc.save();
            logger.info(`Training ${doc._id} has been added`);
          });
        } catch (error) {
          logger.error(error);
        }
      } else {
        logger.info(`Training ${trainingItem._id} nothing to do`);
      }
    });
    codeEnData.stats();
    bcnData.stats();
    pSupData.stats();
    affelnetData.stats();

    logger.info(" -- End of Trainings updater -- ");
  } catch (err) {
    logger.error(err);
  }
};

module.exports.run = run;
