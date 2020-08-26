const { getDataFromCfd } = require("./handlers/cfdHandler");
const { getModaliteFromMef10 } = require("./handlers/mefHandler");
const { getDataFromCP } = require("./handlers/geoHandler");

const run = async (
  options = {
    mode: "cfd_info",
    value: "XXXX",
  }
) => {
  try {
    if (options.mode === "cfd_info") {
      return getDataFromCfd(options.value);
    } else if (options.mode === "mef_modalite") {
      return getModaliteFromMef10(options.value);
    } else if (options.mode === "cp_info") {
      const r = await getDataFromCP(options.value);
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

// run({
//   mode: "cp_info",
//   value: "92004",
// });
