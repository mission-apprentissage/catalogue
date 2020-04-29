// #region Imports
const readXLSXFile = require("./FileUtils").readXLSXFile;
const getJsonDataFromWorksheet = require("./FileUtils").getJsonDataFromWorksheet;

const HeaderCatalogue = [
  "nom",
  "diplome",
  "intitule",
  "codeEducNat",
  "niveau",
  "periode",
  "capacite",
  "uai",
  "email",
  "codePostal",
];

// #endregion

class FileManager {
  constructor() {
    this.catalogeData = [];
  }

  /**
   * Get Catalog Data from File
   * @param {string} catalogFilePath
   */
  getDataFromFile(catalogFilePath, range) {
    try {
      if (this.catalogData) {
        return this.catalogData;
      } else {
        // Read file
        const { sheet_name_list, workbook } = readXLSXFile(catalogFilePath);

        // Get WorkSheets
        const catalogueWorksheet = workbook.Sheets[sheet_name_list[0]];

        // Build JsonData
        this.catalogData = getJsonDataFromWorksheet(catalogueWorksheet, HeaderCatalogue, range);
        return this.catalogData;
      }
    } catch (err) {
      console.error(err);
      return null;
    }
  }
}

const fileManager = new FileManager();
module.exports = fileManager;
