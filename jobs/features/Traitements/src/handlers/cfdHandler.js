const bcnController = require("../controllers/bcn/bcnController");
const fcController = require("../controllers/fc/fcController");

const getDataFromCfd = providedCfd => {
  const bcnData = bcnController.getDataFromCfd(providedCfd);

  const codeRncpUpdated = fcController.findRncpFromCfd(bcnData.result.cfd);
  const rncpData = fcController.getDataFromRncp(codeRncpUpdated.value);

  return {
    result: {
      ...bcnData.result,
      rncp: { ...rncpData.result },
    },
    messages: {
      ...bcnData.messages,
      rncp: { ...rncpData.messages },
    },
  };
};
module.exports.getDataFromCfd = getDataFromCfd;
