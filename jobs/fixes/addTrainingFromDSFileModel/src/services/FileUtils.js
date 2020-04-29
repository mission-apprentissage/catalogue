const XLSX = require("xlsx");
const csvToJson = require("convert-csv-to-json");

const readJsonFromCsvFile = localPath => {
  const jsonArray = csvToJson.getJsonFromCsv(localPath);
  return jsonArray;
};
module.exports.readJsonFromCsvFile = readJsonFromCsvFile;

const readXLSXFile = localPath => {
  const workbook = XLSX.readFile(localPath, { codepage: 65001 });
  return { sheet_name_list: workbook.SheetNames, workbook };
};
module.exports.readXLSXFile = readXLSXFile;

const getJsonDataFromWorksheet = (worksheet, headers, range) => {
  const jsonData = XLSX.utils.sheet_to_json(worksheet, {
    header: headers,
    range: range,
  });

  return jsonData;
};
module.exports.getJsonDataFromWorksheet = getJsonDataFromWorksheet;
