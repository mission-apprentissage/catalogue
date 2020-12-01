// #region Imports
const csvToJson = require("convert-csv-to-json-latin");
const path = require("path");
const XLSX = require("xlsx");

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

  getXLSXFile() {
    const formationsFilePath = path.join(__dirname, "../../assets", "Rco_ponctuel.xlsx");

    const jsonArray = this.getXLSX(formationsFilePath);

    return jsonArray;
  }

  getXLSX(filePath) {
    try {
      const { sheet_name_list, workbook } = this.readXLSXFile(filePath);
      const worksheet = workbook.Sheets[sheet_name_list[0]];

      const jsonSheetArray = XLSX.utils.sheet_to_json(worksheet, {
        header: [
          "etablissement_gestionnaire_siret",
          "etablissement_gestionnaire_adresse",
          "etablissement_gestionnaire_code_postal",
          "etablissement_gestionnaire_code_insee",
          "etablissement_formateur_siret",
          "etablissement_formateur_adresse",
          "etablissement_formateur_code_postal",
          "etablissement_formateur_code_insee",
          "etablissement_lieu_formation_adresse",
          "etablissement_lieu_formation_code_postal",
          "etablissement_lieu_formation_code_insee",
          "cfd",
          "rncp_code",
          "debut_sessions",
        ],
        range: 2,
        raw: false,
      });

      return jsonSheetArray;
    } catch (err) {
      return null;
    }
  }

  readXLSXFile(localPath) {
    const workbook = XLSX.readFile(localPath, { codepage: 65001 });

    return { sheet_name_list: workbook.SheetNames, workbook };
  }
}

const fileManager = new FileManager();
module.exports = fileManager;
