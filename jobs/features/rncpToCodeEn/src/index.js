const fs = require("fs");
const path = require("path");
const { execute } = require("../../../../common/scriptWrapper");
const importRNCP = require("./importRNCP");

const run = async (options = {}) => {
  await execute(() => {
    const codeDiplomesFile = path.join(__dirname, "assets", "codes_diplomes.v1.2.csv");

    const codesDiplomesStream = fs.createReadStream(codeDiplomesFile, { encoding: "UTF-8" });

    return importRNCP(codesDiplomesStream, options);
  });
};

module.exports.run = run;

if (process.env.RNCP_EXEC === "1") {
  console.log("run");
  run();
}
