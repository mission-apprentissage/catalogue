const createReferentiel = require("./utils/referentielCodesDiplomesRncp");
const { pipeline, writeObject } = require("../../../../common/streamUtils");
const logger = require("../../../common-jobs/Logger").mainLogger;
const { Formation } = require("../../../../common/models2");

module.exports = async (codesDiplomesFile, options = {}) => {
  let referentiel = createReferentiel();
  let stats = {
    formations: {
      updatedRncpFromCodeEn: 0,
      updatedCodeEnFromRncp: 0,
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
        const updateMode = options.updateMode ? options.updateMode : "findCodeEn";

        try {
          if (updateMode === "findCodeEn") {
            if (f.rncp_code) {
              if (!f.educ_nat_code || (f.educ_nat_code && options.overrideMode)) {
                let educ_nat_code = referentiel.findCodeEn(f.rncp_code);
                f.educ_nat_code = educ_nat_code;
                logger.debug(
                  `Updating formation ${f._id} : educ_nat_code updated to ${f.educ_nat_code} with rncp_code ${f.rncp_code} found`
                );
                await f.save();
                stats.formations.updatedCodeEnFromRncp++;
              }
            }
          } else if (updateMode === "findCodeRNCP") {
            if (f.educ_nat_code) {
              if (!f.rncp_code || (f.rncp_code && options.overrideMode)) {
                let rncp_code = referentiel.findCodeRNCP(f.educ_nat_code);
                f.rncp_code = rncp_code;
                logger.debug(
                  `Updating formation ${f._id} : rncp_code updated to ${f.rncp_code} with educ_nat_code ${f.educ_nat_code} found`
                );
                await f.save();
                stats.formations.updatedRncpFromCodeEn++;
              }
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
