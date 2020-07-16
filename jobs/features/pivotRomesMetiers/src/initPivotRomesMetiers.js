const { connectToMongo } = require("../../../../common/mongo");
const { RomesMetiers } = require("../../../../common/models2");
const logger = require("../../../common-jobs/Logger").mainLogger;

const run = async () => {
  try {
    logger.info(" -- Start of pivotRomesMetiers initializer -- ");
    await connectToMongo();

    logger.info(" -- End of pivotRomesMetiers initializer -- ");
  } catch (err) {
    logger.error(err);
  }
};

module.exports.run = run;
