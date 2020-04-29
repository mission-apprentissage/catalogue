const { execute } = require("../../../common/script/scriptWrapper");
const logger = require("../../../common/Logger").mainLogger;
const { Establishment, Formation } = require("../../../common/models");
const { getElasticInstance } = require("../../../common/esClient");

let rebuildIndex = async (index, schema) => {
  let client = getElasticInstance();

  logger.info(`Removing '${index}' index...`);
  await client.indices.delete({ index });

  logger.info(`Rebuilding '${index}' index...`);
  await schema.synchronize();
};

let migrateFormations = async () => {
  logger.info("Migrating 'Formation' collection in MongoDB...");
  let res = await Formation.collection.updateMany(
    {},
    {
      $set: {
        rncp_code: null,
        rome_codes: [],
        rncp_eligible_apprentissage: false,
        rncp_etablissement_formateur_habilite: false,
        rncp_etablissement_responsable_habilite: false,
        rncp_etablissement_reference_habilite: false,
      },
      $unset: {
        etablissement_formateur_rncp_habilite: 1,
        etablissement_responsable_rncp_habilite: 1,
        etablissement_reference_rncp_habilite: 1,
      },
    }
  );

  await rebuildIndex("formations", Formation);

  return res.result.nModified;
};

let migrateEtablissements = async () => {
  logger.info("Migrating 'etablissements' collection in MongoDB...");
  let res = await Establishment.collection.updateMany(
    {},
    {
      $unset: {
        computed_rncp_habilite: 1,
      },
    }
  );

  await rebuildIndex("etablissements", Establishment);

  return res.result.nModified;
};

execute(async () => {
  let [formations, etablissements] = await Promise.all([migrateFormations(), migrateEtablissements()]);
  return { formations, etablissements };
});
