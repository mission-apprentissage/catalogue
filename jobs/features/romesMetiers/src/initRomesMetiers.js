const { connectToMongo } = require("../../../../common/mongo");
const { RomesMetiers } = require("../../../../common/models2");
const logger = require("../../../common-jobs/Logger").mainLogger;
const XLSX = require("xlsx");

const run = async () => {
  try {
    logger.info(" -- Start of RomesMetiers initializer -- ");
    await connectToMongo();

    //TODO: suppression de la collection
    //TODO: suppression de l'index

    const readXLSXFile = localPath => {
      const workbook = XLSX.readFile(localPath, { codepage: 65001 });
      return { sheet_name_list: workbook.SheetNames, workbook };
    };

    const fichierRomesMetiers = "./assets/romesMetiers.ods";
    const workbookRomesMetiers = readXLSXFile(fichierRomesMetiers);

    let romesMetiers = XLSX.utils.sheet_to_json(
      workbookRomesMetiers.workbook.Sheets[workbookRomesMetiers.sheet_name_list[0]]
    );

    for (let i = 0, l = romesMetiers.length; i < l; ++i) {
      let romesMetier = new RomesMetiers({
        ...romesMetiers[i],
        domaines: romesMetiers[i].domaines.split(",").map(item => item.trim()),
        familles: romesMetiers[i].familles.split(",").map(item => item.trim()),
        codes_romes: romesMetiers[i].codes_romes.split(", "),
        intitules_romes: JSON.parse(romesMetiers[i].intitules_romes),
        couples_romes_metiers: JSON.parse(romesMetiers[i].couples_romes_metiers),
      });

      await romesMetier.save();

      logger.info(`Added ${romesMetier._id} to collection `);

      //console.log(romesMetier);
    }

    logger.info(" -- End of RomesMetiers initializer -- ");
  } catch (err) {
    logger.error(err);
  }
};

module.exports.run = run;
