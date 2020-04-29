// #region Imports

const path = require("path");
const readXLSXFile = require("./FileUtils").readXLSXFile;
const XLSX = require("xlsx");
const logger = require("../../../../../common/Logger").mainLogger;

const ypareoFilePath = path.join(__dirname, "../../_inputFiles/SIFA_SIRET_V1.xlsx");
const ypareoFileHeader = [
  "CODE_CLIENT",
  "NOM_SITE",
  "UAI",
  "SIRET",
  "UAI Principal",
  "Nb apprenant",
  "Nb formation",
  "Nb site",
];

// #endregion

class FileManager {
  constructor() {
    logger.info("FileManager - Init Reference Files");
    this.ypareoData = this.getYpareoData(ypareoFilePath);
    logger.info("FileManager - End Init Reference Files");
  }

  // #region Mapping Files Methods

  /**
   * Get Data from File
   * @param {string} filePath
   */
  getYpareoData(filePath) {
    try {
      if (this.ypareoData) {
        return this.ypareoData;
      } else {
        const { sheet_name_list, workbook } = readXLSXFile(filePath);
        const worksheet = workbook.Sheets[sheet_name_list[0]];
        const jsonSheetArray = XLSX.utils.sheet_to_json(worksheet, {
          header: ypareoFileHeader,
          range: 1,
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
