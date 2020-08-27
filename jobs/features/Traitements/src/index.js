const { getDataFromCfd } = require("./handlers/cfdHandler");
const { getDataFromMef10 } = require("./handlers/mefHandler");
const { getDataFromCP } = require("./handlers/geoHandler");
const { getDataFromRncp } = require("./handlers/rncpHandler");

const run = async (
  options = {
    mode: "cfd_info",
    value: "XXXX",
  }
) => {
  try {
    if (options.mode === "cfd_info") {
      return getDataFromCfd(options.value);
    } else if (options.mode === "mef_info") {
      const r = await getDataFromMef10(options.value);
      console.log(r);
      return r;
    } else if (options.mode === "cp_info") {
      const r = await getDataFromCP(options.value);
      console.log(r);
      return r;
    } else if (options.mode === "rncp_info") {
      const r = await getDataFromRncp(options.value);
      console.log(r);
      return r;
    }
  } catch (error) {
    console.log(error);
    return {
      result: {},
      messages: {
        error: error.message,
      },
    };
  }
};

module.exports.run = run;

run({
  mode: "mef_info",
  value: "4173320611",
});
