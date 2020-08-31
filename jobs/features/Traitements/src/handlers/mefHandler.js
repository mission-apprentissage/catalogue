const bcnController = require("../controllers/bcn/bcnController");
const fcController = require("../controllers/fc/fcController");

const getDataFromMef10 = providedMef10 => {
  const bcnData = bcnController.getDataFromMef10(providedMef10);

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
module.exports.getDataFromMef10 = getDataFromMef10;
