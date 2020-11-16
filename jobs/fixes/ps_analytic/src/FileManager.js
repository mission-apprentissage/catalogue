// #region Imports
const path = require("path");
const XLSX = require("xlsx");
const fs = require("fs");

// #endregion

class FileManager {
  createJson = async (fileName, data) => {
    fs.writeFile(`${__dirname}/assets` + fileName, JSON.stringify(data), "utf8", error => {
      if (error) throw error;
    });
  };

  getXLSXFile() {
    //const formationsFilePath = path.join(__dirname, "./assets", "listeFormationApprentissagePsup.xlsx");
    const formationsFilePath = path.join(__dirname, "./assets", "Liste_Formation_Apprentissage_Psup.xlsx");
    const jsonArray = this.getXLSX(formationsFilePath);
    return jsonArray;
  }

  getXLSX(filePath) {
    try {
      const { sheet_name_list, workbook } = this.readXLSXFile(filePath);
      const worksheet = workbook.Sheets[sheet_name_list[0]];

      const jsonSheetArray = XLSX.utils.sheet_to_json(worksheet, {
        header: [
          "UAI_GES",
          "UAI_COMPOSANTE",
          "LIB_COMPOSANTE",
          "LIB_INS",
          "UAI_AFF",
          "LIB_AFF",
          "CODECOMMUNE",
          "LIBCOMMUNE",
          "CODEPOSTAL",
          "ACADEMIE",
          "MINISTERETUTELLE",
          "LIBMINISTERE",
          "TYPEETA",
          "CODEFORMATION",
          "LIBFORMATION",
          "CODESPECIALITE",
          "LIBSPECIALITE",
          "CODESPEFORMATIONINITIALE",
          "CODEMEF",
        ],
        range: 1,
        raw: false,
      });

      return jsonSheetArray;
    } catch (err) {
      return null;
    }
  }

  readXLSXFile(localPath) {
    console.log("HELLO", localPath);
    const workbook = XLSX.readFile(localPath, { codepage: 65001 });

    return { sheet_name_list: workbook.SheetNames, workbook };
  }
}

const fileManager = new FileManager();
module.exports = fileManager;
