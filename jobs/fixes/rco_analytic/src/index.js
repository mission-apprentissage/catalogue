const logger = require("../../../common-jobs/Logger").mainLogger;
const rcoChecker = require("./updaters/rcoData/rcoChecker");

const run = async () => {
  try {
    logger.info(" -- Start of RCO Analyse  -- ");

    await rcoChecker.run();

    logger.info(" -- End of RCO Analyse -- ");
  } catch (err) {
    logger.error(err);
  }
};

run();
