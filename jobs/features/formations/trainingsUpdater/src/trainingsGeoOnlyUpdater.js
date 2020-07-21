const { connectToMongo } = require("../../../../../common/mongo");
const { Formation } = require("../../../../../common/models2");

const logger = require("../../../../common-jobs/Logger").mainLogger;
const asyncForEach = require("../../../../common-jobs/utils").asyncForEach;
const establishmentsGeolocData = require("./updaters/establishmentsGeolocData");

const run = async (updateOnly = null) => {
  try {
    logger.info(" -- Start of Trainings updater for geo location only -- ");
    await connectToMongo();

    const filter = !updateOnly ? {} : updateOnly;

    const trainings = await Formation.find(filter);

    await asyncForEach(trainings, async trainingItem => {
      let updatedTraining = {
        ...trainingItem._doc,
      };
      let updatedNeeded = false;

      // Update Establishments information
      const updatesEstablishmentsData = await establishmentsGeolocData.getUpdates(updatedTraining);
      if (updatesEstablishmentsData) {
        updatedTraining = {
          ...updatedTraining,
          ...updatesEstablishmentsData,
        };
        updatedNeeded = true;
      }

      // Update training
      if (updatedNeeded) {
        updatedTraining.last_update_at = Date.now();
        try {
          await Formation.findOneAndUpdate({ _id: trainingItem._id }, updatedTraining, { new: true });
          logger.info(`Training ${trainingItem._id} has been updated`);
        } catch (error) {
          logger.error(error);
        }
      } else {
        logger.info(`Training ${trainingItem._id} nothing to do`);
      }
    });

    logger.info(" -- End of Trainings updater -- ");
  } catch (err) {
    logger.error(err);
  }
};

module.exports.run = run;
