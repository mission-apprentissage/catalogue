const { pipeline, writeObject } = require("../../../../../common/streamUtils");
const logger = require("../../../../common-jobs/Logger").mainLogger;
const { Formation, Establishment } = require("../../../../../common/models2");
const createReferentiel = require("../utils/referentiel");
const { infosCodes, computeCodes } = require("../utils/constants");

module.exports = async () => {
  const importToTrainings = async options => {
    logger.info(" -- Starting Import OPCOs to trainings -- ");
    const referentiel = await createReferentiel();

    let stats = {
      updated: 0,
      noCodeEn: 0,
      noIdccsFound: 0,
      noOpcosFound: 0,
      errors: 0,
    };

    logger.info("Updating formations...");
    await pipeline(
      await Formation.find({}).cursor(),
      writeObject(
        async f => {
          try {
            const overrideMode = options.override ? options.override : false;
            if (f.opcos.length === 0 || overrideMode) {
              if (!f.educ_nat_code) {
                f.info_opcos = infosCodes.NoCodeEn;
                f.info_opcos_intitule = computeCodes[infosCodes.NoCodeEn];
                stats.noCodeEn++;
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
                  f.info_opcos_intitule = computeCodes[infosCodes.Found];
                  stats.updated++;
                } else {
                  logger.info(`No OPCOs found for formation ${f._id} for educ_nat_code ${f.educ_nat_code}`);

                  if ((await referentiel.findIdccsFromCodeEn(f.educ_nat_code).length) === 0) {
                    f.info_opcos = infosCodes.NoIdccsFound;
                    f.info_opcos_intitule = computeCodes[infosCodes.NoIdccsFound];
                    stats.noIdccsFound++;
                  } else {
                    f.info_opcos = infosCodes.NoOpcosFound;
                    f.info_opcos_intitule = computeCodes[infosCodes.NoOpcosFound];
                    stats.noOpcosFound++;
                  }
                }
              }

              await f.save();
            }
          } catch (e) {
            stats.errors++;
            logger.error(e);
          }
        },
        { parallel: 5 }
      )
    );
    logger.info(" -- End of Import OPCOs to trainings -- ");
    return stats;
  };

  const importToEtablishments = async options => {
    logger.info(" -- Starting Import OPCOs to etablishments -- ");

    let stats = {
      opcosForEtablishmentUpdated: 0,
      opcosForEtablishmentNotFound: 0,
      opcosForEtablishmentError: 0,
    };

    logger.info("Updating etablishments...");
    await pipeline(
      await Establishment.find({ uai: { $nin: [null, ""] } })
        .batchSize(5000)
        .cursor(),
      writeObject(
        async e => {
          try {
            const overrideMode = options.override ? options.override : false;
            if (e.opcos.length === 0 || overrideMode) {
              // Gets all formations having opcos linked to uai on etablissement_formateur_uai
              const formationsOpcosForUai = await (
                await Formation.find({
                  etablissement_formateur_uai: `${e.uai}`,
                })
              ).filter(x => x.opcos.length > 0);

              if (formationsOpcosForUai.length === 0) {
                stats.opcosForEtablishmentNotFound++;
                logger.info(`No OPCOs found linked to etablissement ${e._id}`);
              } else {
                e.opcos = [...new Set(formationsOpcosForUai.flatMap(x => x.opcos))]; // Unique opcos
                e.opcos_formations = formationsOpcosForUai.map(x => {
                  return {
                    formation_id: x._id,
                    opcos: x.opcos,
                  };
                }); // List of couple formation / opcos
                stats.opcosForEtablishmentUpdated++;
                logger.info(`Adding OPCOs found ${e.opcos} for formations linked to etablissement ${e._id}`);
              }
              await e.save();
            }
          } catch (e) {
            stats.opcosForEtablishmentError++;
            logger.error(e);
          }
        },
        { parallel: 5 }
      )
    );
    logger.info(" -- End of Import OPCOs to etablishments -- ");
    return stats;
  };

  return {
    importOpcosToTrainings: importToTrainings,
    importOpcosToEtablishments: importToEtablishments,
    importOpcos: async options => {
      logger.info(" -- Import OPCOs --");
      const importTrainingStats = await importToTrainings(options);
      const importEtablishmentsStats = await importToEtablishments(options);
      const stats = { ...importTrainingStats, ...importEtablishmentsStats };
      logger.info(" -- Stats -- ");
      logger.info(stats);
      logger.info(" -- End of Import OPCOs --");
    },
  };
};
