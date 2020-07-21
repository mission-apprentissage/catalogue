const logger = require("../../../common-jobs/Logger").mainLogger;
const rcoChecker = require("./updaters/rcoData/rcoChecker");

const run = async () => {
  try {
    logger.info(" -- Start of RCO updater -- ");

    await rcoChecker.run();

    logger.info(" -- End of RCO updater -- ");
  } catch (err) {
    logger.error(err);
  }
};

run();
