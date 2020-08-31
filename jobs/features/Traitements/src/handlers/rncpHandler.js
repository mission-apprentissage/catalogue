const fcController = require("../controllers/fc/fcController");
const bcnController = require("../controllers/bcn/bcnController");

const getDataFromRncp = providedRncp => {
  const rncpData = fcController.getDataFromRncp(providedRncp);

  const cfdData = bcnController.getDataFromCfd(rncpData.result.cfd);
  const mefs = bcnController.getMefsFromCfd(cfdData.result.cfd);
  const mef10Data = bcnController.getMef10DataFromMefs(mefs);

  return {
    result: {
      ...rncpData.result,
      cfd: {
        ...cfdData.result,
      },
      mefs: {
        ...mefs.result,
        ...mef10Data.result,
      },
    },
    messages: {
      ...rncpData.messages,
      cfd: {
        ...cfdData.messages,
      },
      mefs: {
        ...mefs.messages,
        ...mef10Data.messages,
      },
    },
  };
};
module.exports.getDataFromRncp = getDataFromRncp;
