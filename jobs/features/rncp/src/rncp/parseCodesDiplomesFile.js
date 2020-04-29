const fs = require("fs");
const { pipeline, parseCSV, writeObject } = require("../../../../common/script/streamUtils");

module.exports = async file => {
  let codesDiplomes = [];

  await pipeline(
    fs.createReadStream(file, { encoding: "UTF-8" }),
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
