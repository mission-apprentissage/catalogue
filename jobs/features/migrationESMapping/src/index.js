const logger = require("../../../common-jobs/Logger").mainLogger;
const { Establishment, Formation, DomainesMetiers } = require("../../../common-jobs/models");
const { getElasticInstance } = require("../../../../common/esClient");
const { execute } = require("../../../../common/scriptWrapper");

/*
  WARNING : this script is MANDATORY in order to use geo location. 
*/

let rebuildIndex = async (index, schema) => {
  let client = getElasticInstance();

  logger.info(`Removing '${index}' index...`);
  await client.indices.delete({ index });

  logger.info(`Re-creating '${index}' index with mapping...`);
  await schema.createMapping(); // this explicit call of createMapping insures that the geo points fields will be treated accordingly during indexing

  logger.info(`Synching '${index}' index ...`);
  await schema.synchronize();
};

let indexingFormations = async () => {
  logger.info("Indexing 'Formation' collection from MongoDB...");

  await rebuildIndex("formations", Formation);

  logger.info("Index Formation rebuilt with mapping");
};

let indexingEtablissements = async () => {
  logger.info("Indexing 'etablissements' collection from MongoDB...");

  await rebuildIndex("etablissements", Establishment);

  logger.info("Index Etablissement rebuilt with mapping");
};

let indexingDomainesMetiers = async () => {
  logger.info("Indexing 'domainesmetiers' collection from MongoDB...");

  await rebuildIndex("domainesmetiers", DomainesMetiers);

  logger.info("Index DomainesMetiers rebuilt with mapping");
};

execute(async () => {
  await Promise.all([indexingFormations(), indexingEtablissements(), indexingDomainesMetiers()]);
  logger.info("migrationESMapping has finished");
});
