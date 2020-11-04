const logger = require("../../../common-jobs/Logger").mainLogger;
const importer = require("./importer/importer");
const { execute } = require("../../../../common/scriptWrapper");

const run = async () => {
  await execute(async () => {
    try {
      logger.info(" -- Start of RCO importer -- ");

      await importer.run();

      logger.info(" -- End of RCO importer -- ");
    } catch (err) {
      logger.error(err);
    }
  });
};

run();
