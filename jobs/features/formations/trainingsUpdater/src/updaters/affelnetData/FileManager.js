// #region Imports
const csvToJson = require("convert-csv-to-json");
const { PATH_FORMATION_APPRENTISSAGE_AFFELNET } = require("./Constants");
const logger = require("../../../../../../common-jobs/Logger").mainLogger;

// #endregion

class FileManager {
  constructor() {
    logger.info("FileManager - Init Reference Files");

    this.dataAffelnetFormation = this.getDataAffelnetFromFile(PATH_FORMATION_APPRENTISSAGE_AFFELNET);

    logger.info("FileManager - End Init Reference Files");
  }

  /**
   * Get Data Affelnet formation from File
   * @param {string} affelnetFormationPath
   */
  getDataAffelnetFromFile(affelnetFormationPath) {
    try {
      if (this.dataAffelnetFormation) {
        return this.dataAffelnetFormation;
      } else {
        return this.readJsonFromCsvFile(affelnetFormationPath);
      }
    } catch (err) {
      logger.error(`FileManager getDataAffelnetFromFile Error ${err}`);
      return null;
    }
  }

  readJsonFromCsvFile(localPath) {
    const jsonArray = csvToJson.getJsonFromCsv(localPath);
    return jsonArray;
  }
}

const fileManager = new FileManager();
module.exports = fileManager;
