const logger = require("../../../common-jobs/Logger").mainLogger;
const checker = require("./Checker");

const run = async () => {
  try {
    logger.info(" -- Start of Analyse  -- ");

    await checker.run();

    logger.info(" -- End of Analyse -- ");
  } catch (err) {
    logger.error(err);
  }
};

run();
