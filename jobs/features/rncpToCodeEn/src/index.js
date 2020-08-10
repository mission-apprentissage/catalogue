const fs = require("fs");
const path = require("path");
const { execute } = require("../../../../common/scriptWrapper");
const importRNCP = require("./importRNCP");

const run = async (options = {}, connectMongo = true) => {
  await execute(() => {
    const codeDiplomesFile = path.join(__dirname, "assets", "codes_diplomes.v1.2.csv");
    return importRNCP(codeDiplomesFile, options);
  }, connectMongo);
};

module.exports.run = run;

if (process.env.RNCP_EXEC === "1") {
  console.log("run");
  run({
    mode: process.env.MODE,
  });
}
