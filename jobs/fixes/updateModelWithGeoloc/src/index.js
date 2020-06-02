const logger = require("../../../common-jobs/Logger").mainLogger;
const { Establishment, Formation } = require("../../../common-jobs/models");
const { getElasticInstance } = require("../../../../common/esClient");
const { runEstablishmentUpdater } = require("../../../features/etablissements/etablishmentsUpdater/src");
const { runTrainingUpdater } = require("../../../features/formations/trainingsUpdater/src");

let rebuildIndex = async (index, schema) => {
  let client = getElasticInstance();

  logger.info(`Removing '${index}' index...`);
  await client.indices.delete({ index });

  logger.info(`Re-creating '${index}' index with mapping...`);
  await schema.createMapping();
};

let indexingFormations = async () => {
  logger.info("Indexing 'Formation' collection from MongoDB...");

  await rebuildIndex("formations", Formation);

  await runTrainingUpdater();
};

let indexingEtablissements = async () => {
  logger.info("Indexing 'etablissements' collection from MongoDB...");

  await rebuildIndex("etablissements", Establishment);

  await runEstablishmentUpdater();
};

const run = async () => {
  await indexingEtablissements();

  await indexingFormations();

  logger.info("Fin de la reconstruction d'index");
};

run();
