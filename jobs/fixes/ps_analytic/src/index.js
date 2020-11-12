const logger = require("../../../common-jobs/Logger").mainLogger;
const checker = require("./Checker");

const run = async () => {
  try {
    logger.info(" -- Start of Analysis  -- ");

    await checker.run();

    logger.info(" -- End of Analysis -- ");
  } catch (err) {
    logger.error(err);
  }
};

run();
