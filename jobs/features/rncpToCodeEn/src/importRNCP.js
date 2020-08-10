const createReferentiel = require("./rncp/referentiel");
const { pipeline, writeObject } = require("../../../../common/streamUtils");
const logger = require("../../../common-jobs/Logger").mainLogger;
const { Formation } = require("../../../../common/models2");

module.exports = async (codesDiplomesFile, options = {}) => {
  let referentiel = createReferentiel();
  let stats = {
    formations: {
      updated_foundCodeEn: 0,
      updated_foundCodeRncp: 0,
      errors: 0,
    },
    referentiel: 0,
  };

  logger.info("Loading RNCP referentiel (Fiches + Code Diplômes)...");
  stats.referentiel = await referentiel.load(codesDiplomesFile);

  logger.info("Updating formations...");
  await pipeline(
    Formation.find(options.query ? options.query : {}).cursor(),
    writeObject(
      async f => {
        const mode = options.mode ? options.mode : "findCodeEn";

        try {
          if (mode === "findCodeEn") {
            if (f.rncp_code) {
              let educ_nat_code = referentiel.findCodeEn(f.rncp_code);
              f.educ_nat_code = educ_nat_code;
              logger.debug(`CodeEn Found - updating formation ${f.educ_nat_code}...`);
              await f.save();
              stats.formations.updated_foundCodeEn++;
            }
          } else if (mode === "findCodeRNCP") {
            if (f.educ_nat_code) {
              let rncp_code = referentiel.findCodeRNCP(f.educ_nat_code);
              f.rncp_code = rncp_code;
              logger.debug(`CodeRncp found - updating formation ${f.educ_nat_code}...`);
              await f.save();
              stats.formations.updated_foundCodeRncp++;
            }
          }
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
