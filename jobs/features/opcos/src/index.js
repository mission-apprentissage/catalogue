const { execute } = require("../../../../common/scriptWrapper");
const opcoImporter = require("./importer/opcoImporter");

const run = async () => {
  const importer = await opcoImporter();
  await execute(() => {
    return importer.importOpcosToEtablishments({
      override: process.env.OVERRIDE_MODE === "true",
    });
  });
};

run();
