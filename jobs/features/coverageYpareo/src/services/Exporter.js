const XLSX = require("xlsx");
const path = require("path");
const writeFile = require("./FileUtils").writeFile;

class Exporter {
  constructor() {}

  toWorksheet(collection = null, name) {
    if (!collection) return;

    const jsonArray = Array.from(collection.values());

    return {
      name,
      content: XLSX.utils.json_to_sheet(jsonArray), // Converts an array of JS objects to a worksheet
    };
  }

  async toXlsx(collection = null, fileName) {
    if (!collection) return;

    const { name, content } = this.toWorksheet(collection);

    const workbook = XLSX.utils.book_new(); // Create a new blank workbook
    XLSX.utils.book_append_sheet(workbook, content, name); // Add the worksheet to the workbook

    const writeFile = () =>
      new Promise(resolve => {
        XLSX.writeFileAsync(path.join(__dirname, `../../output/${fileName}`), workbook, e => {
          if (e) {
            console.log(e);
          }
          resolve();
        });
      });

    await writeFile();
  }

  async toJson(collection = null, fileName) {
    if (!collection || collection.size === 0) return;

    await writeFile(Array.from(collection.values()), path.join(__dirname, `../../output/${fileName}`));
  }
}

module.exports = Exporter;
