// #region Imports
const { connectToMongo } = require("../../../../common/mongo");
const { getElasticInstance } = require("../../../../common/esClient");
const logger = require("../../../common-jobs/Logger").mainLogger;

const { Formation } = require("../../../common-jobs/models");

const run = async () => {
  try {
    logger.info(" -- Start Remove Unused Fields -- ");
    await connectToMongo();

    // Remove fields
    await Formation.collection.updateMany(
      {},
      { $unset: { etablissement_formateur_siret_intitule: "", etablissement_reference_api_entreprise_reference: 1 } }
    );
    await rebuildIndex("formations", Formation);

    logger.info(" -- End Remove Unused Fields -- ");
  } catch (err) {
    logger.error(err);
  }
};

const rebuildIndex = async (index, schema) => {
  let client = getElasticInstance();

  logger.info(`Removing '${index}' index...`);
  await client.indices.delete({ index });

  logger.info(`Rebuilding '${index}' index...`);
  await schema.synchronize();
};

run();
