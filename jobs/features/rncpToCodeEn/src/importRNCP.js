const createReferentiel = require("./rncp/referentiel");
const { pipeline, writeObject } = require("../../../../common/streamUtils");
const logger = require("../../../common-jobs/Logger").mainLogger;
const { Formation } = require("../../../../common/models2");

module.exports = async (codesDiplomesStream, options = {}) => {
  let referentiel = createReferentiel();
  let stats = {
    formations: {
      updated: 0,
      errors: 0,
    },
    referentiel: 0,
  };

  logger.info("Loading RNCP referentiel (Fiches + Code Diplômes)...");
  stats.referentiel = await referentiel.loadXmlFile(codesDiplomesStream);

  logger.info("Updating formations...");
  await pipeline(
    Formation.find(options.query ? options.query : {}).cursor(),
    writeObject(
      async f => {
        let educ_nat_code = referentiel.findCodeEn(f.rncp_code);

        try {
          f.educ_nat_code = educ_nat_code;

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
