const { connectToMongo } = require("../../../../common/mongo");
const { Formation } = require("../../../common-jobs/models");
const logger = require("../../../common-jobs/Logger").mainLogger;
const asyncForEach = require("../../../common-jobs/utils").asyncForEach;
//const rcoChecker = require("./updaters/rcoData/rcoChecker");

const run = async () => {
  try {
    logger.info(" -- Start of RCO updater -- ");
    await connectToMongo();

    const trainings = await Formation.find({});

    await asyncForEach(trainings, async trainingItem => {
      let updatedTraining = {
        ...trainingItem._doc,
      };
      console.log(updatedTraining);
    });

    logger.info(" -- End of RCO updater -- ");
  } catch (err) {
    logger.error(err);
  }
};

run();
