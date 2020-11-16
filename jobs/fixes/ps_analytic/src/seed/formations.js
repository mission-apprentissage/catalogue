const { formationParcoursup } = require("../../../../common-jobs/models");
const FileManager = require("../FileManager");
const asyncForEach = require("../../../../common-jobs/utils").asyncForEach;

module.exports = async () => {
  const data = FileManager.getXLSXFile();

  asyncForEach(data, async item => {
    console.log(item);
  });
};
