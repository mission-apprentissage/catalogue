const { execute } = require("../../../../common/scriptWrapper");
const logger = require("../../../common-jobs/Logger").mainLogger;
const { Formation } = require("../../../common-jobs/models");
const { getElasticInstance } = require("../../../../common/esClient");

let rebuildIndex = async index => {
  // let rebuildIndex = async (index, schema) => {
  let client = getElasticInstance();

  logger.info(`Removing '${index}' index...`);
  await client.indices.delete({ index });

  logger.info(`Rebuilding '${index}' index...`);
  //await schema.synchronize();
};

let migrateFormations = async () => {
  logger.info("Migrating 'Formation' collection in MongoDB...");
  let res = await Formation.collection.updateMany(
    {},
    {
      $set: {
        affelnet_a_charger: false,
      },
      // $unset: {
      //   etablissement_formateur_rncp_habilite: 1,
      //   etablissement_responsable_rncp_habilite: 1,
      //   etablissement_reference_rncp_habilite: 1,
      // },
    }
  );

  await rebuildIndex("formations", Formation);

  return res.result.nModified;
};

// let migrateEtablissements = async () => {
//   logger.info("Migrating 'etablissements' collection in MongoDB...");
//   let res = await Establishment.collection.updateMany(
//     {},
//     {
//       $unset: {
//         computed_rncp_habilite: 1,
//       },
//     }
//   );

//   await rebuildIndex("etablissements", Establishment);

//   return res.result.nModified;
// };

execute(async () => {
  let [formations] = await Promise.all([migrateFormations()]);
  return { formations };
});
