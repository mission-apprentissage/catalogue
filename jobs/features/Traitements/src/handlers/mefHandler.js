const bcnController = require("../controllers/bcn/bcnController");
const fcController = require("../controllers/fc/fcController");

const getDataFromMef10 = providedMef10 => {
  const mefData = bcnController.getDataFromMef10(providedMef10);
  const cfdData = bcnController.getDataFromCfd(mefData.result.cfd);

  const codeRncpUpdated = fcController.findRncpFromCfd(cfdData.result.cfd);
  const rncpData = fcController.getDataFromRncp(codeRncpUpdated.value);

  return {
    result: {
      ...mefData.result,
      cfd: {
        ...cfdData.result,
      },
      rncp: { ...rncpData.result },
    },
    messages: {
      ...mefData.messages,
      cfd: {
        ...cfdData.messages,
      },
      rncp: { ...rncpData.messages },
    },
  };
};
module.exports.getDataFromMef10 = getDataFromMef10;
