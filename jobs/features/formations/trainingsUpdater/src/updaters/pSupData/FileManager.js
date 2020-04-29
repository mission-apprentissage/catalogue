// #region Imports
const csvToJson = require("convert-csv-to-json");
const { PATH_FORMATION_APPRENTISSAGE_PSUP } = require("./Constants");
const logger = require("../../../../../../common/Logger").mainLogger;

// #endregion

class FileManager {
  constructor() {
    logger.info("FileManager - Init Reference Files");

    this.dataPsupFormation = this.getDataPSupFromFile(PATH_FORMATION_APPRENTISSAGE_PSUP);

    logger.info("FileManager - End Init Reference Files");
  }

  /**
   * Get Data Psup formation from File
   * @param {string} pSupFormationPath
   */
  getDataPSupFromFile(pSupFormationPath) {
    try {
      if (this.dataPsupFormation) {
        return this.dataPsupFormation;
      } else {
        return this.readJsonFromCsvFile(pSupFormationPath);
      }
    } catch (err) {
      logger.error(`FileManager getDataPSupFromFile Error ${err}`);
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
