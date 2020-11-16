const XLSX = require("xlsx");
const path = require("path");

const toXlsx = async (jsonData, fileName) => {
  const WS = XLSX.utils.json_to_sheet(jsonData);

  const workbook = XLSX.utils.book_new(); // Create a new blank workbook
  XLSX.utils.book_append_sheet(workbook, WS, "book"); // Add the worksheet to the workbook

  const writeFile = () =>
    new Promise(resolve => {
      XLSX.writeFileAsync(path.join(__dirname, `/export/${fileName}`), workbook, e => {
        if (e) {
          console.log(e);
        }
        resolve();
      });
    });

  await writeFile();
};
module.exports.toXlsx = toXlsx;
