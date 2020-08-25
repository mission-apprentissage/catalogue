const path = require("path");
const { execute } = require("../../../../common/scriptWrapper");
const updateCodes = require("./updateCodes");

const run = async (options = {}, connectMongo = true) => {
  await execute(() => {
    const codeDiplomesFile = path.join(__dirname, "assets", "codes_diplomes.v1.2.csv");
    return updateCodes(codeDiplomesFile, options);
  }, connectMongo);
};

module.exports.run = run;

if (process.env.RNCP_EXEC === "1") {
  console.log("run");
  run({
    updateMode: process.env.UPDATE_MODE,
    overrideMode: process.env.OVERRIDE_MODE,
  });
}
