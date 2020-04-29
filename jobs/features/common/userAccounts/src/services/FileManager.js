// #region Imports
const path = require("path");
const logger = require("../../../../../common/Logger").mainLogger;

const readXLSXFile = require("./FileUtils").readXLSXFile;
const getJsonDataFromWorksheet = require("./FileUtils").getJsonDataFromWorksheet;

const headerUserList = ["PAM", "ACADEMIE", "MAIL", "AJOUTE"];
const usersListFileName = "ParticipantsPAM.xlsx";
const usersListFilePath = path.join(__dirname, `../../input/${usersListFileName}`);

// #endregion

class FileManager {
  constructor() {
    this.usersListData = this.getDataFromFile();
  }

  /**
   * Get Catalog Data from File
   * @param {string} usersListFilePath
   */
  getDataFromFile(filePath = usersListFilePath, range = 1) {
    try {
      if (this.usersListData) {
        return this.usersListData;
      } else {
        // Read file
        const { sheet_name_list, workbook } = readXLSXFile(filePath);

        // Get WorkSheets
        const worksheet = workbook.Sheets[sheet_name_list[0]];

        // Build JsonData
        this.usersListData = getJsonDataFromWorksheet(worksheet, headerUserList, range);
        return this.usersListData;
      }
    } catch (err) {
      logger.error(err);
      return null;
    }
  }
}

const fileManager = new FileManager();
module.exports = fileManager;
