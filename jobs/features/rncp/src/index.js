const fs = require("fs");
const path = require("path");
const env = require("env-var");
const { execute } = require("../../../../common/scriptWrapper");
const { getS3ObjectAsStream } = require("../../../common-jobs/awsS3");
const importRNCP = require("./importRNCP");

execute(() => {
  const rncpFichesFile = env.get("RNCP_FICHES_FILE").asString();
  const codeDiplomesFile = path.join(__dirname, "assets", "codes_diplomes.v1.1.csv");

  const codesDiplomesStream = fs.createReadStream(codeDiplomesFile, { encoding: "UTF-8" });
  const fileInputStream = rncpFichesFile
    ? fs.createReadStream(rncpFichesFile, { encoding: "UTF-8" })
    : getS3ObjectAsStream("mna-services/features/rncp/export_fiches_RNCP_2020-05-27.xml");

  return importRNCP(fileInputStream, codesDiplomesStream);
});
