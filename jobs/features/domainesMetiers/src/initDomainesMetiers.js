const { connectToMongo } = require("../../../../common/mongo");
const { DomainesMetiers } = require("../../../../common/models2");
const logger = require("../../../common-jobs/Logger").mainLogger;
const XLSX = require("xlsx");

const run = async () => {
  try {
    logger.info(" -- Start of DomainesMetiers initializer -- ");
    await connectToMongo();

    //TODO: suppression de la collection
    //TODO: suppression de l'index

    const readXLSXFile = localPath => {
      const workbook = XLSX.readFile(localPath, { codepage: 65001 });
      return { sheet_name_list: workbook.SheetNames, workbook };
    };

    const fichierDomainesMetiers = "./assets/domainesMetiers.ods";
    const workbookDomainesMetiers = readXLSXFile(fichierDomainesMetiers);

    let domainesMetiers = XLSX.utils.sheet_to_json(
      workbookDomainesMetiers.workbook.Sheets[workbookDomainesMetiers.sheet_name_list[0]]
    );

    for (let i = 0, l = domainesMetiers.length; i < l; ++i) {
      let domainesMetier = new DomainesMetiers({
        ...domainesMetiers[i],
        domaines: domainesMetiers[i].domaines.split(",").map(item => item.trim()),
        familles: domainesMetiers[i].familles.split(",").map(item => item.trim()),
        codes_romes: domainesMetiers[i].codes_romes.split(", "),
        intitules_romes: JSON.parse(domainesMetiers[i].intitules_romes),
        couples_romes_metiers: JSON.parse(domainesMetiers[i].couples_romes_metiers),
      });

      await domainesMetier.save();

      logger.info(`Added ${domainesMetier._id} to collection `);

      //console.log(romesMetier);
    }

    logger.info(" -- End of DomainesMetiers initializer -- ");
  } catch (err) {
    logger.error(err);
  }
};

module.exports.run = run;
