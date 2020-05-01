// #region Imports

const filePathConstants = require("./constants/FilePathConstants");
const fileHeadersConstants = require("./constants/FileHeadersConstants");
const readXLSXFile = require("./FileUtils").readXLSXFile;
const readJsonFromCsvFile = require("./FileUtils").readJsonFromCsvFile;
const XLSX = require("xlsx");
const logger = require("../../../../../../common-jobs/Logger").mainLogger;

// #endregion

class FileManager {
  constructor() {
    logger.info("FileManager - Init Reference Files");

    this.dataGouvOfsJsonData = this.getDataGouvOfsDataFromFile(filePathConstants.PATH_DATAGOUV_OFS_FILE);
    this.dataDockJsonData = this.getDataDockDataFromFile(filePathConstants.PATH_BASE_DATADOCK);
    this.catalogDGEFPData = this.getCatalogDGEFPDataFromFile(filePathConstants.PATH_LISTDGEFP_FILE);
    this.catalogDEPPData = this.getCatalogDEPPDataFromFile(filePathConstants.PATH_LISTDEPP_FILE);

    logger.info("FileManager - End Init Reference Files");
  }

  // #region Mapping Files Methods

  /**
   * Get Data Dock Data from File
   * @param {string} dataDockFilePath
   */
  getDataDockDataFromFile(dataDockFilePath) {
    try {
      if (this.dataDockJsonData) {
        return this.dataDockJsonData;
      } else {
        const { sheet_name_list, workbook } = readXLSXFile(dataDockFilePath);
        const worksheet = workbook.Sheets[sheet_name_list[0]];
        const jsonSheetArray = XLSX.utils.sheet_to_json(worksheet, {
          header: fileHeadersConstants.DataDockFileHeader,
          range: 0,
        });
        return jsonSheetArray;
      }
    } catch (err) {
      logger.error(`FileManager Error ${err}`);
      return null;
    }
  }

  /**
   * Get DGEFP Data from File
   * @param {string} DGEFPFilePath
   */
  getCatalogDGEFPDataFromFile(DGEFPFilePath) {
    try {
      if (this.catalogDGEFPData) {
        return this.catalogDGEFPData;
      } else {
        const { sheet_name_list, workbook } = readXLSXFile(DGEFPFilePath);
        const worksheet = workbook.Sheets[sheet_name_list[0]];
        const jsonSheetArray = XLSX.utils.sheet_to_json(worksheet, {
          header: fileHeadersConstants.DGEFPFileHeader,
          range: 0,
        });
        return jsonSheetArray;
      }
    } catch (err) {
      logger.error(`DS FileManager Error ${err}`);
      return null;
    }
  }

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
          range: 0,
        });
        return jsonSheetArray;
      }
    } catch (err) {
      logger.error(`DS FileManager Error ${err}`);
      return null;
    }
  }

  /**
   * Get Data Gouv OFS Data from File
   * @param {string} dataGouvOfsFilePath
   */
  getDataGouvOfsDataFromFile(dataGouvOfsFilePath) {
    try {
      if (this.dataGouvOfsJsonData) {
        return this.dataGouvOfsJsonData;
      } else {
        return readJsonFromCsvFile(dataGouvOfsFilePath);
      }
    } catch (err) {
      logger.error(`DS FileManager Error ${err}`);
      return null;
    }
  }
}

const fileManager = new FileManager();
module.exports = fileManager;
