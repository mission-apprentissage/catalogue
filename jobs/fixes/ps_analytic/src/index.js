const logger = require("../../../common-jobs/Logger").mainLogger;
const checker = require("./Checker");
const { getMefInfo } = require("./utils");

const run = async () => {
  try {
    logger.info(" -- Start of Analysis  -- ");

    await checker.runOld();

    logger.info(" -- End of Analysis -- ");
  } catch (err) {
    logger.error(err);
  }
};

run();
