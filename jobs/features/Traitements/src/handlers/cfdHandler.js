const bcnController = require("../controllers/bcn/bcnController");
const fcController = require("../controllers/fc/fcController");

const getDataFromCfd = providedCfd => {
  const bcnData = bcnController.getDataFromCfd(providedCfd);

  if (!bcnData.result.cfd) {
    return {
      result: {
        ...bcnData.result,
        rncp: {},
        mefs: {},
      },
      messages: {
        ...bcnData.messages,
        rncp: {},
        mefs: {},
      },
    };
  }

  const mefs = bcnController.getMefsFromCfd(bcnData.result.cfd);
  const mef = bcnController.getUniqMefFromMefs(mefs);

  const codeRncpUpdated = fcController.findRncpFromCfd(bcnData.result.cfd);
  const rncpData = fcController.getDataFromRncp(codeRncpUpdated.value);

  return {
    result: {
      ...bcnData.result,
      rncp: { ...rncpData.result },
      mefs: {
        ...mefs.result,
        ...mef.result,
      },
    },
    messages: {
      ...bcnData.messages,

      rncp: { ...rncpData.messages },
      mefs: {
        ...mefs.messages,
        ...mef.messages,
      },
    },
  };
};
module.exports.getDataFromCfd = getDataFromCfd;
