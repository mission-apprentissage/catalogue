const logger = require("../../../common-jobs/Logger").mainLogger;
const { connectToMongo, closeMongoConnection } = require("../../../../common/mongo");
const { Formation, Establishment } = require("../../../../common/models2");

const run = async () => {
  try {
    await connectToMongo();
    logger.info(" -- Stats of OPCO Linker -- ");
    const formations = await Formation.find();

    // Stats classiques - Formations
    const formationsAvecOpco = await Formation.find({ opcos: { $ne: [] } });
    const formationsSansOpcos = await Formation.find({ opcos: [] });
    const formationsSansOpcosEtSansCodeEducNat = await Formation.find({
      $and: [{ opcos: [] }, { educ_nat_code: { $in: [null, ""] } }],
    });
    const formationsSansOpcosEtAvecCodeEducNat = await Formation.find({
      $and: [{ opcos: [] }, { educ_nat_code: { $nin: [null, ""] } }],
    });

    // Stats avec info_opcos
    const formationsOpcosEmpty = await Formation.find({ info_opcos: 0 });
    const formationsOpcosFound = await Formation.find({ info_opcos: 1 });
    const formationsOpcosNoCodeEn = await Formation.find({ info_opcos: 2 });
    const formationsOpcosNotFoundNoIdccs = await Formation.find({ info_opcos: 3 });
    const formationsOpcosNotFoundNoOpcos = await Formation.find({ info_opcos: 4 });

    // Stats Etablissements
    const etablissements = await Establishment.find();
    const etablissementsAvecOpcos = await Establishment.find({ opcos: { $nin: [[], null] } });

    logger.info(`${formations.length} formations`);
    logger.info(`${formationsAvecOpco.length} formations avec OPCOs`);
    logger.info(`${formationsSansOpcos.length} formations sans OPCOs`);
    logger.info(`${formationsSansOpcosEtSansCodeEducNat.length} formations sans OPCOs et sans code diplome`);
    logger.info(`${formationsSansOpcosEtAvecCodeEducNat.length} formations sans OPCOs et avec code diplome`);

    logger.info(`${formationsOpcosEmpty.length} formations avec OPCOs vides`);
    logger.info(`${formationsOpcosFound.length} formations avec OPCOs trouvés`);
    logger.info(`${formationsOpcosNoCodeEn.length} formations sans OPCOs et sans code diplome`);
    logger.info(`${formationsOpcosNotFoundNoIdccs.length} formations sans OPCOs - pas de lien code diplome / IDCCs`);
    logger.info(`${formationsOpcosNotFoundNoOpcos.length} formations sans OPCOs - pas de lien IDCCs / OPCOs`);

    logger.info(`${etablissements.length} établissements`);
    logger.info(`${etablissementsAvecOpcos.length} établissements avec OPCOs`);

    logger.info(" -- End Stats of OPCO Linker -- ");
    closeMongoConnection();
  } catch (err) {
    logger.error(err);
  }
};

run();
