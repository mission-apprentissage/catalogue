const path = require("path");
const env = require("env-var");
const { execute } = require("../../../common/script/scriptWrapper");
const importRNCP = require("./importRNCP");

execute(() => {
  const rncpFichesFile = env
    .get("RNCP_FICHES_FILE")
    .required()
    .asString();

  return importRNCP(rncpFichesFile, path.join(__dirname, "assets", "codes_diplomes.csv"));
});
