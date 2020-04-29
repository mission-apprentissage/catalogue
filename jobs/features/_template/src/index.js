// #region Imports
const { connectToMongo } = require("../../../common/mongo");
const logger = require("../../../common/Logger").mainLogger;

const { Establishment, Formation } = require("../../../common/models");

const run = async () => {
  try {
    logger.info(" -- Start _TEMPLATE -- ");
    await connectToMongo();

    // const establishment = new Establishment({ siret: "3333" });
    // await establishment.save();

    const establishment = await Establishment.findById("5e888b7014fe886fa2fbee28");
    logger.info(establishment);

    // await Establishment.findOneAndRemove({ _id: "5e888b7014fe886fa2fbee28" });

    logger.info(" -- End _TEMPLATE -- ");
  } catch (err) {
    logger.error(err);
  }
};

run();
