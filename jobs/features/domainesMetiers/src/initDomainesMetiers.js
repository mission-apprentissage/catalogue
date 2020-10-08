const { connectToMongo } = require("../../../../common/mongo");
const { getElasticInstance } = require("../../../../common/esClient");
const { DomainesMetiers } = require("../../../../common/models2");
const logger = require("../../../common-jobs/Logger").mainLogger;
const XLSX = require("xlsx");
const path = require("path");

const emptyMongo = async () => {
  try {
    const metiers = await DomainesMetiers.find({});

    logger.info(`Clearing domainesmetiers db...`);
    metiers.forEach(async metier => {
      await DomainesMetiers.findByIdAndDelete(metier._id);
    });
  } catch (err) {
    logger.info(`Error emptying mongo table : ${err.message}`);
  }
};

const clearIndex = async () => {
  try {
    let client = getElasticInstance();
    logger.info(`Removing domainesmetiers index...`);
    await client.indices.delete({ index: "domainesmetiers" });
  } catch (err) {
    logger.info(`Error emptying es index : ${err.message}`);
  }
};

const createIndex = async () => {
  let requireAsciiFolding = true;
  await DomainesMetiers.createMapping(requireAsciiFolding);
};

const run = async () => {
  try {
    logger.info(" -- Start of DomainesMetiers initializer -- ");
    await connectToMongo();

    await emptyMongo();
    await clearIndex();
    await createIndex();

    const readXLSXFile = localPath => {
      const workbook = XLSX.readFile(localPath, { codepage: 65001 });
      return { sheet_name_list: workbook.SheetNames, workbook };
    };

    const fichierDomainesMetiers = path.join(__dirname, "./assets/domainesMetiers.xlsx");
    const workbookDomainesMetiers = readXLSXFile(fichierDomainesMetiers);

    let domaines, familles, codesROMEs, intitulesROMEs, couplesROMEsIntitules;

    const reset = () => {
      domaines = [];
      familles = [];
      codesROMEs = [];
      intitulesROMEs = [];
      couplesROMEsIntitules = [];
    };

    for (let i = 0; i < workbookDomainesMetiers.sheet_name_list.length; ++i) {
      logger.info(`Début traitement lettre : ${workbookDomainesMetiers.sheet_name_list[i]}`);

      let onglet = XLSX.utils.sheet_to_json(
        workbookDomainesMetiers.workbook.Sheets[workbookDomainesMetiers.sheet_name_list[i]]
      );

      reset();

      for (let j = 0; j < onglet.length; j++) {
        if (onglet[j].isSousDomaine) {
          // cas de la ligne sur laquelle se trouve le sous-domaine qui va marquer l'insertion d'une ligne dans la db

          let domainesMetier = new DomainesMetiers({
            domaine: onglet[j]["Domaine "], // haha, vous l'avez vu cet espace à la fin ? :)
            sous_domaine: onglet[j]["Sous domaine "], // et celui là ?
            mots_clefs: onglet[j]["mots clés"],
            domaines: domaines,
            familles: familles,
            codes_romes: codesROMEs,
            intitules_romes: intitulesROMEs,
            couples_romes_metiers: couplesROMEsIntitules,
          });

          await domainesMetier.save();

          logger.info(`Added ${domainesMetier.sous_domaine} ${domainesMetier._id} to collection `);

          reset();
        } else {
          if (onglet[j].Domaine && domaines.indexOf(onglet[j].Domaine.trim()) < 0)
            domaines.push(onglet[j].Domaine.trim());
          if (onglet[j].Famille && familles.indexOf(onglet[j].Famille.trim()) < 0)
            familles.push(onglet[j].Famille.trim());

          //couplesROMEsIntitules
          if (
            (onglet[j]["Codes ROME"] &&
              onglet[j]["Intitulé code ROME"] &&
              codesROMEs.indexOf(onglet[j]["Codes ROME"].trim()) < 0) ||
            intitulesROMEs.indexOf(onglet[j]["Intitulé code ROME"].trim()) < 0
          ) {
            couplesROMEsIntitules.push({
              codeRome: onglet[j]["Codes ROME"].trim(),
              intitule: onglet[j]["Intitulé code ROME"].trim(),
            });
          }

          if (onglet[j]["Codes ROME"] && codesROMEs.indexOf(onglet[j]["Codes ROME"].trim()) < 0)
            codesROMEs.push(onglet[j]["Codes ROME"].trim());
          if (onglet[j]["Intitulé code ROME"] && intitulesROMEs.indexOf(onglet[j]["Intitulé code ROME"].trim()) < 0)
            intitulesROMEs.push(onglet[j]["Intitulé code ROME"].trim());
        }
      }
    }
  } catch (err) {
    logger.error(err);
  } finally {
    process.exit();
  }
};

module.exports.run = run;
