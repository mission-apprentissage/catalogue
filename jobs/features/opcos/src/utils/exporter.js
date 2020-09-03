const XLSX = require("xlsx");
const { parse } = require("json2csv");
const { writeFile, chown } = require("fs").promises;

const toWorksheet = (collection = null, name) => {
  if (!collection) return;

  const jsonArray = Array.from(collection.values());

  return {
    name,
    content: XLSX.utils.json_to_sheet(jsonArray), // Converts an array of JS objects to a worksheet
  };
};

const toXlsx = async (data, outputDirectory, fileName, workbookName, options) => {
  let workbook = XLSX.utils.book_new();
  let ws = XLSX.utils.json_to_sheet(data);
  let file = `${outputDirectory}/${fileName}`;

  XLSX.utils.book_append_sheet(workbook, ws, workbookName);
  await XLSX.writeFile(workbook, file, { type: "file" });

  if (options.owner) {
    await chown(file, options.owner.uid, options.owner.gid);
  }
};

const toCsv = async (data, outputDirectory, fileName, options = {}) => {
  let file = `${outputDirectory}/${fileName}`;
  let csvData = parse(data, { delimiter: options.delimiter || "," });

  await writeFile(file, options.utf8Bom === true ? "\ufeff" + csvData : csvData, "utf8");

  if (options.owner) {
    await chown(file, options.owner.uid, options.owner.gid);
  }
};

module.exports = {
  toWorksheet,
  toXlsx,
  toCsv,
};
