const bcnController = require("../controllers/bcn/bcnController");
const fcController = require("../controllers/fc/fcController");

const getDataFromCfd = providedCfd => {
  const bcnData = bcnController.getDataFromCfd(providedCfd);

  const mefs = bcnController.getMefsFromCfd(bcnData.result.cfd);
  const mef10Data = bcnController.getMef10DataFromMefs(mefs);

  const codeRncpUpdated = fcController.findRncpFromCfd(bcnData.result.cfd);
  const rncpData = fcController.getDataFromRncp(codeRncpUpdated.value);

  return {
    result: {
      ...bcnData.result,
      rncp: { ...rncpData.result },
      mefs: {
        ...mefs.result,
        ...mef10Data.result,
      },
    },
    messages: {
      ...bcnData.messages,

      rncp: { ...rncpData.messages },
      mefs: {
        ...mefs.messages,
        ...mef10Data.messages,
      },
    },
  };
};
module.exports.getDataFromCfd = getDataFromCfd;
