const { connectToMongo, closeMongoConnection } = require("../../../../common/mongo");
const logger = require("../../../common-jobs/Logger").mainLogger;
const checker = require("./Checker");

const run = async () => {
  try {
    logger.info(" -- Start of Analysis  -- ");
    await connectToMongo();

    await checker.run();

    await closeMongoConnection();
    logger.info(" -- End of Analysis -- ");
  } catch (err) {
    logger.error(err);
    await closeMongoConnection();
  }
};

run();
