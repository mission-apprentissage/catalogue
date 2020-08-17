const logger = require("../../../common-jobs/Logger").mainLogger;
const { connectToMongo, closeMongoConnection } = require("../../../../common/mongo");
const { Formation, Establishment } = require("../../../../common/models2");

const run = async () => {
  try {
    await connectToMongo();
    logger.info(" -- Stats of OPCO Linker -- ");
    const formations = await Formation.find();

    const formationsAvecOpco = await Formation.find({ opcos: { $ne: [] } });
    const formationsSansOpcos = await Formation.find({ opcos: [] });
    const formationsSansOpcosEtSansCodeEducNat = await Formation.find({
      $and: [{ opcos: [] }, { educ_nat_code: { $in: [null, ""] } }],
    });
    const formationsSansOpcosEtAvecCodeEducNat = await Formation.find({
      $and: [{ opcos: [] }, { educ_nat_code: { $nin: [null, ""] } }],
    });

    const etablissements = await Establishment.find();
    const etablissementsAvecOpcos = await Establishment.find({ opcos: { $ne: [] } });

    logger.info(`${formations.length} formations`);
    logger.info(`${formationsAvecOpco.length} formations avec OPCOs`);
    logger.info(`${formationsSansOpcos.length} formations sans OPCOs`);
    logger.info(`${formationsSansOpcosEtSansCodeEducNat.length} formations sans OPCOs et sans educNatCode`);
    logger.info(`${formationsSansOpcosEtAvecCodeEducNat.length} formations sans OPCOs et avec educNatCode`);

    logger.info(`${etablissements.length} établissements`);
    logger.info(`${etablissementsAvecOpcos.length} établissements avec OPCOs`);

    logger.info(" -- End Stats of OPCO Linker -- ");
    closeMongoConnection();
  } catch (err) {
    logger.error(err);
  }
};

run();
