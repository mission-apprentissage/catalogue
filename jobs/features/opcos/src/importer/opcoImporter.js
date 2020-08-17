const { pipeline, writeObject } = require("../../../../../common/streamUtils");
const logger = require("../../../../common-jobs/Logger").mainLogger;
const { Formation, Establishment } = require("../../../../../common/models2");
const createReferentiel = require("../utils/referentiel");
const { infosCodes, computeCodes } = require("../utils/constants");

module.exports = async () => {
  const importToTrainings = async () => {
    logger.info(" -- Starting Import OPCOs to trainings -- ");
    const referentiel = await createReferentiel();

    let stats = {
      opcosForTrainingUpdated: 0,
      opcosForTrainingNotFound: 0,
      opcosForTrainingErrors: 0,
    };

    logger.info("Updating formations...");
    await pipeline(
      await Formation.find({}).cursor(),
      writeObject(
        async f => {
          try {
            if (!f.educ_nat_code) {
              f.info_opcos = infosCodes.NotFoundable;
              f.info_opcos_intitule = computeCodes[infosCodes.NotFoundable];
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
                stats.opcosForTrainingUpdated++;
              } else {
                logger.info(`No OPCOs found for formation ${f._id} for educ_nat_code ${f.educ_nat_code}`);
                f.info_opcos = infosCodes.NotFound;
                f.info_opcos_intitule = computeCodes[infosCodes.NotFound];
                stats.opcosForTrainingNotFound++;
              }
            }

            await f.save();
          } catch (e) {
            stats.opcosForTrainingErrors++;
            logger.error(e);
          }
        },
        { parallel: 5 }
      )
    );
    logger.info(" -- End of Import OPCOs to trainings -- ");
    return stats;
  };

  const importToEtablishments = async () => {
    logger.info(" -- Starting Import OPCOs to etablishments -- ");

    let stats = {
      opcosForEtablishmentUpdated: 0,
      opcosForEtablishmentNotFound: 0,
      opcosForEtablishmentError: 0,
    };

    logger.info("Updating etablishments...");
    await pipeline(
      await Establishment.find({ uai: { $nin: [null, ""] } }).cursor(),
      writeObject(
        async e => {
          try {
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
    importOpcos: async () => {
      logger.info(" -- Import OPCOs --");
      const importTrainingStats = await importToTrainings();
      const importEtablishmentsStats = await importToEtablishments();
      const stats = { ...importTrainingStats, ...importEtablishmentsStats };
      logger.info(" -- Stats -- ");
      logger.info(stats);
      logger.info(" -- End of Import OPCOs --");
    },
  };
};
