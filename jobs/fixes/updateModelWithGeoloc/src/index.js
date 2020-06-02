const logger = require("../../../common-jobs/Logger").mainLogger;
const { Establishment, Formation } = require("../../../common-jobs/models");
const { getElasticInstance } = require("../../../../common/esClient");
const { runEstablishmentUpdater } = require("../../../features/etablissements/etablishmentsUpdater/src");
const { runTrainingUpdater } = require("../../../features/formations/trainingsUpdater/src");

let rebuildIndex = async (index, schema) => {
  let client = getElasticInstance();

  logger.info(`Removing '${index}' index...`);
  //await client.indices.delete({ index });

  logger.info(`Re-creating '${index}' index with mapping...`);
  //await schema.createMapping();
};

let migrateFormations = async () => {
  logger.info("Migrating 'Formation' collection in MongoDB...");

  await rebuildIndex("formations", Formation);

  await runTrainingUpdater();

  // Formation.synchronize();   // <- utile ou implicite
};

let migrateEtablissements = async () => {
  logger.info("Migrating 'etablissements' collection in MongoDB...");

  await rebuildIndex("etablissements", Establishment);

  await runEstablishmentUpdater();

  // Establishment.synchronize();   // <- utile ou implicite
};

const run = async () => {
  await migrateEtablissements();

  await migrateFormations();

  logger.info("Fin de la reconstruction d'index");
};
