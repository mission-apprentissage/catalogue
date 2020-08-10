const csvToJson = require("convert-csv-to-json");

module.exports = async filePath => {
  let codesDiplomes = csvToJson.getJsonFromCsv(filePath);
  return { codesDiplomes };
};
