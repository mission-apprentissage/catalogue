const fs = require("fs");
const path = require("path");
const env = require("env-var");
const { execute } = require("../../../../common/scriptWrapper");
const { getS3ObjectAsStream } = require("../../../common-jobs/awsS3");
const importRNCP = require("./importRNCP");

const run = async (options = {}) => {
  await execute(() => {
    const rncpFichesFile = env.get("RNCP_FICHES_FILE").asString();
    const codeDiplomesFile = path.join(__dirname, "assets", "codes_diplomes.v1.2.csv");

    const codesDiplomesStream = fs.createReadStream(codeDiplomesFile, { encoding: "UTF-8" });
    const fileInputStream = rncpFichesFile
      ? fs.createReadStream(rncpFichesFile, { encoding: "UTF-8" })
      : getS3ObjectAsStream("mna-services/features/rncp/export-fiches-rncp-2020-06-29.xml");

    return importRNCP(fileInputStream, codesDiplomesStream, options);
  });
};

module.exports.run = run;

if (process.env.RNCP_EXEC === "1") {
  console.log("run");
  run();
}
