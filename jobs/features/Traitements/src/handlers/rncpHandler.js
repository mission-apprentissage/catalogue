const fcController = require("../controllers/fc/fcController");
const bcnController = require("../controllers/bcn/bcnController");

const getDataFromRncp = providedRncp => {
  const rncpData = fcController.getDataFromRncp(providedRncp);

  const cfdData = bcnController.getDataFromCfd(rncpData.result.cfd);

  return {
    result: {
      ...rncpData.result,
      cfd: {
        ...cfdData.result,
      },
    },
    messages: {
      ...rncpData.messages,
      cfd: {
        ...cfdData.messages,
      },
    },
  };
};
module.exports.getDataFromRncp = getDataFromRncp;
