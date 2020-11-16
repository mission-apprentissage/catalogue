const logger = require("../../../../common-jobs/Logger").mainLogger;
const { connectToMongo } = require("../../../../../common/mongo");
const formation = require("./formations");

const run = async () => {
  try {
    logger.info(" -- Start : Import des données parcoursup  -- ");
    await connectToMongo();

    await formation();

    logger.info(" -- End : Import des données parcoursup -- ");
  } catch (err) {
    logger.error(err);
  }
};

run();
