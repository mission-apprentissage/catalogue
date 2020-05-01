const { pipeline, writeObject } = require("../../../../../common/streamUtils");
const parseCSV = require("csv-parse");

module.exports = async inputStream => {
  let codesDiplomes = [];

  await pipeline(
    inputStream,
    parseCSV({
      delimiter: ";",
      skip_lines_with_error: true,
      skip_empty_lines: true,
      columns: ["CodeDiplome", "Intitule", "CodeRNCP", "Niveau2019", "Diplome"],
    }),
    writeObject(line => {
      codesDiplomes[line["CodeRNCP"]] = line["CodeDiplome"];
    })
  );

  return { codesDiplomes };
};
