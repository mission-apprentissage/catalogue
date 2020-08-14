const { pipeline, writeObject } = require("../../../../../common/streamUtils");
const logger = require("../../../../common-jobs/Logger").mainLogger;
const { Formation } = require("../../../../../common/models2");
const createReferentiel = require("../utils/referentiel");
const { infosCodes } = require("../utils/constants");

module.exports = async () => {
  logger.info(" -- Start of OPCOs Importer -- ");
  const referentiel = await createReferentiel();

  let stats = {
    opcosUpdated: 0,
    opcosNotFound: 0,
    errors: 0,
  };

  logger.info("Updating formations...");
  await pipeline(
    await Formation.find({}).cursor(),
    writeObject(
      async f => {
        try {
          if (!f.educ_nat_code) {
            f.info_opcos = infosCodes.NotFoundable;
          } else {
            const opcosForFormations = await referentiel.findOpcosFromCodeEn(f.educ_nat_code);

            if (opcosForFormations.length > 0) {
              logger.info(
                `Adding OPCOs ${opcosForFormations.map(x => x.Opérateurdecompétences)} for formation ${
                  f._id
                } for educ_nat_code ${f.educ_nat_code}`
              );
              f.opcos = opcosForFormations.map(x => x.Opérateurdecompétences);
              f.info_opcos = infosCodes.Found;
              stats.opcosUpdated++;
            } else {
              logger.info(`No OPCOs found for formation ${f._id} for educ_nat_code ${f.educ_nat_code}`);
              f.info_opcos = infosCodes.NotFound;
              stats.opcosNotFound++;
            }
          }

          await f.save();
        } catch (e) {
          stats.errors++;
          logger.error(e);
        }
      },
      { parallel: 5 }
    )
  );
  logger.info(" -- End of OPCOs Importer -- ");
  return stats;
};
