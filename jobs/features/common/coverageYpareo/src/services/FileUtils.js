const XLSX = require("xlsx");
const path = require("path");

const readXLSXFile = localPath => {
  const workbook = XLSX.readFile(localPath, { codepage: 65001 });
  return { sheet_name_list: workbook.SheetNames, workbook };
};
module.exports.readXLSXFile = readXLSXFile;

const writeXlsxFile = async (worksheets = [], filePath, fileName) => {
  if (worksheets.length === 0) return;

  const workbook = XLSX.utils.book_new(); // Create a new blank workbook

  for (let i = 0; i < worksheets.length; i++) {
    const { name, content } = worksheets[i];
    XLSX.utils.book_append_sheet(workbook, content, name); // Add the worksheet to the workbook
  }

  const execWrite = () =>
    new Promise(resolve => {
      XLSX.writeFileAsync(path.join(__dirname, `${filePath}/${fileName}`), workbook, e => {
        if (e) {
          console.log(e);
        }
        resolve();
      });
    });

  await execWrite();
};
module.exports.writeXlsxFile = writeXlsxFile;
