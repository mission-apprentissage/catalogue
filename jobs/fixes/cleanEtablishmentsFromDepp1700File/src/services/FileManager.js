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
    this.catalogDEPPData = this.getCatalogDEPPDataFromFile(filePathConstants.PATH_LISTDEPP_FILE);
    logger.info("FileManager - End Init Reference Files");
  }

  // #region Mapping Files Methods

  /**
   * Get DEPP Data from File
   * @param {string} DEPPFilePath
   */
  getCatalogDEPPDataFromFile(DEPPFilePath) {
    try {
      if (this.catalogDEPPData) {
        return this.catalogDEPPData;
      } else {
        const { sheet_name_list, workbook } = readXLSXFile(DEPPFilePath);
        const worksheet = workbook.Sheets[sheet_name_list[0]];
        const jsonSheetArray = XLSX.utils.sheet_to_json(worksheet, {
          header: fileHeadersConstants.FichierDeppHeader,
          range: 1,
        });
        return jsonSheetArray;
      }
    } catch (err) {
      logger.error(`FileManager Error ${err}`);
      return null;
    }
  }

  /**
   * Get DEPP Data from File
   * @param {string} DEPPFilePath
   */
  getDEPPDataFromFile(DEPPFilePath) {
    try {
      const { sheet_name_list, workbook } = readXLSXFile(DEPPFilePath);
      const worksheet = workbook.Sheets[sheet_name_list[0]];
      const jsonSheetArray = XLSX.utils.sheet_to_json(worksheet, {
        header: fileHeadersConstants.FichierDeppHeader,
        range: 1,
      });
      return jsonSheetArray;
    } catch (err) {
      logger.error(`FileManager Error ${err}`);
      return null;
    }
  }
}

const fileManager = new FileManager();
module.exports = fileManager;
