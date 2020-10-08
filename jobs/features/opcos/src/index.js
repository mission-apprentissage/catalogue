const { execute } = require("../../../../common/scriptWrapper");
const opcoImporter = require("./importer/opcoImporter");

const run = async () => {
  await execute(() => {
    return opcoImporter();
  });
};

run();
