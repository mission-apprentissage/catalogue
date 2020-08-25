const createReferentiel = require("./utils/referentielCodesDiplomesRncp");
const { pipeline, writeObject } = require("../../../../common/streamUtils");
const logger = require("../../../common-jobs/Logger").mainLogger;
const { Formation } = require("../../../../common/models");

module.exports = async (codesDiplomesFile, options = {}) => {
  let referentiel = createReferentiel();
  let stats = {
    formations: {
      updateRncp: {
        updated: 0,
        notFound: 0,
      },

      updateCodeEn: {
        updated: 0,
        notFound: 0,
      },

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
        const updateMode = options.updateMode ? options.updateMode : "updateCodeRncpFromCodeEn";
        const overrideMode = options.overrideMode ? (options.overrideMode === "true" ? true : false) : true;
        try {
          if (updateMode === "updateCodeEnFromCodeRncp") {
            if (f.rncp_code) {
              if (!f.educ_nat_code || (f.educ_nat_code && overrideMode)) {
                let educ_nat_code = referentiel.findCodeEn(f.rncp_code);
                f.educ_nat_code = educ_nat_code;
                if (f.educ_nat_code) {
                  logger.debug(
                    `Formation ${f._id} : educ_nat_code updated to ${f.educ_nat_code} with rncp_code ${f.rncp_code} found`
                  );
                  await f.save();
                  stats.formations.updateCodeEn.updated++;
                } else {
                  logger.debug(`Formation ${f._id} : no educ_nat_code found for rncp_code ${f.rncp_code}`);
                  stats.formations.updateCodeEn.notFound++;
                }
              }
            }
          } else if (updateMode === "updateCodeRncpFromCodeEn") {
            if (f.educ_nat_code) {
              if (!f.rncp_code || (f.rncp_code && overrideMode)) {
                let rncp_code = referentiel.findCodeRNCP(f.educ_nat_code);
                if (rncp_code) {
                  f.rncp_code = rncp_code;
                  logger.debug(
                    `Formation ${f._id} : rncp_code updated to ${f.rncp_code} with educ_nat_code ${f.educ_nat_code} found`
                  );
                  await f.save();
                  stats.formations.updateRncp.updated++;
                } else {
                  logger.debug(`Formation ${f._id} : no rncp_code found for educ_nat_code ${f.educ_nat_code}`);
                  stats.formations.updateRncp.notFound++;
                }
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
