// #region Imports
const csvToJson = require("convert-csv-to-json-latin");
const path = require("path");

// #endregion

class FileManager {
  getFile() {
    const formationsFilePath = path.join(
      __dirname,
      "../../assets",
      "formations_apprentissage_csv_ponctuel_20200910.csv"
    );

    const jsonArray = csvToJson.getJsonFromCsv(formationsFilePath);

    return jsonArray;
  }
}

const fileManager = new FileManager();
module.exports = fileManager;
