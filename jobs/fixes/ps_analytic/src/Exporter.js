const XLSX = require("xlsx");
const path = require("path");

class Exporter {
  constructor() {}

  async toXlsx(jsonData, fileName) {
    const WS = XLSX.utils.json_to_sheet(jsonData, {
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
        "ACADÉMIE",
        "MINISTERETUTELLE",
        "LIBMINISTERE",
        "TYPEETA",
        "CODEFORMATION",
        "LIBFORMATION",
        "CODESPÉCIALITÉ",
        "LIBSPÉCIALITÉ",
        "CODESPÉFORMATIONINITIALE",
        "CODEMEF",
      ],
    });

    const workbook = XLSX.utils.book_new(); // Create a new blank workbook
    XLSX.utils.book_append_sheet(workbook, WS, "book"); // Add the worksheet to the workbook

    const writeFile = () =>
      new Promise(resolve => {
        XLSX.writeFileAsync(
          path.join(__dirname, `../${fileName}`),
          workbook,
          //{ bookType: "xlsx", type: "binary" },
          e => {
            if (e) {
              console.log(e);
            }
            resolve();
          }
        );
      });

    await writeFile();
  }
}

module.exports = Exporter;
