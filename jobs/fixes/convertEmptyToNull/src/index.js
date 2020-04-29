// #region Imports
const { connectToMongo } = require("../../../common/mongo");
const logger = require("../../../common/Logger").mainLogger;
const asyncForEach = require("../../../common/utils").asyncForEach;

const { Establishment, Formation } = require("../../../common/models");

const run = async () => {
  try {
    logger.info(" -- Start Convert -- ");
    await connectToMongo();

    const establishments = await Establishment.find({});

    await asyncForEach(establishments, async establishmentItem => {
      let updatedEstablishment = {
        ...establishmentItem._doc,
      };
      for (const prop in updatedEstablishment) {
        if (updatedEstablishment[prop] === "") {
          updatedEstablishment[prop] = null;
        }
      }

      await Establishment.findOneAndUpdate({ _id: updatedEstablishment._id }, updatedEstablishment, {
        new: true,
      });
    });

    const trainings = await Formation.find({});

    await asyncForEach(trainings, async trainingItem => {
      let updatedTraining = {
        ...trainingItem._doc,
      };
      for (const prop in updatedTraining) {
        if (updatedTraining[prop] === "") {
          updatedTraining[prop] = null;
        }
      }

      await Formation.findOneAndUpdate({ _id: updatedTraining._id }, updatedTraining, {
        new: true,
      });
    });

    logger.info(" -- End Convert -- ");
  } catch (err) {
    logger.error(err);
  }
};

run();
