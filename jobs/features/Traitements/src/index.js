const { getDataFromCfd } = require("./handlers/cfdHandler");
const { getModaliteFromMef10 } = require("./handlers/mefHandler");

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
