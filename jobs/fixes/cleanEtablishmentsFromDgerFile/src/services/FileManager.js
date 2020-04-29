// #region Imports

const filePathConstants = require("../constants/FilePathConstants");
const fileHeadersConstants = require("../constants/FileHeadersConstants");
const readXLSXFile = require("./FileUtils").readXLSXFile;
const XLSX = require("xlsx");
const logger = require("./Logger").mainLogger;

// #endregion

class FileManager {
  constructor() {
    logger.info("FileManager - Init Reference Files");
    this.dgerJsonData = this.getDgerDataFromFile(filePathConstants.PATH_DGER_FILE);
    logger.info("FileManager - End Init Reference Files");
  }

  // #region Mapping Files Methods

  /**
   * Get Dger Data from File
   * @param {string} dgerFilePath
   */
  getDgerDataFromFile(dgerFilePath) {
    try {
      if (this.dgerJsonData) {
        return this.dgerJsonData;
      } else {
        const { sheet_name_list, workbook } = readXLSXFile(dgerFilePath);
        const worksheet = workbook.Sheets[sheet_name_list[0]];
        const jsonSheetArray = XLSX.utils.sheet_to_json(worksheet, {
          header: fileHeadersConstants.FichierDgerHeader,
          range: 0,
        });
        return jsonSheetArray;
      }
    } catch (err) {
      logger.error(`FileManager Error ${err}`);
      return null;
    }
  }
}

const fileManager = new FileManager();
module.exports = fileManager;
