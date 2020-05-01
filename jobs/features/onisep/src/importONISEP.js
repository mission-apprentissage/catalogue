const { pipeline, writeObject } = require("../../../../common/script/streamUtils");
const logger = require("../../../common/Logger").mainLogger;
const { Formation } = require("../../../common/models");
const createCatalogue = require("./onisep/catalogue");

module.exports = async (inputStream, options = {}) => {
  let catalogue = createCatalogue();
  let stats = {
    formations: {
      updated: 0,
      errors: 0,
    },
  };

  await catalogue.loadCsvFile(inputStream);

  logger.info("Updating formations...");
  await pipeline(
    Formation.find(options.query ? options.query : {}).cursor(),
    writeObject(
      async f => {
        try {
          f.onisep_url = await catalogue.getUrl(f.educ_nat_code);

          logger.debug(`Updating formation ${f.educ_nat_code}...`);
          await f.save();
          stats.formations.updated++;
        } catch (e) {
          stats.formations.errors++;
          logger.error(e);
        }
      },
      { parallel: 5 }
    )
  );

  return stats;
};
