const logger = require("../../../common-jobs/Logger").mainLogger;
const { connectToMongo, closeMongoConnection } = require("../../../../common/mongo");
const { Formation } = require("../../../../common/models2");

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
    logger.info(`${formations.length} formations`);
    logger.info(`${formationsAvecOpco.length} formations avec opcos`);
    logger.info(`${formationsSansOpcos.length} formations sans opcos`);
    logger.info(`${formationsSansOpcosEtSansCodeEducNat.length} formations sans opcos et sans educNatCode`);
    logger.info(`${formationsSansOpcosEtAvecCodeEducNat.length} formations sans opcos et avec educNatCode`);
    logger.info(" -- End Stats of OPCO Linker -- ");
    closeMongoConnection();
  } catch (err) {
    logger.error(err);
  }
};

run();
