const bcnController = require("../controllers/bcn/bcnController");
const fcController = require("../controllers/fc/fcController");

const getDataFromMef10 = providedMef10 => {
  const bcnData = bcnController.getDataFromMef10(providedMef10);

  const codeRncpUpdated = fcController.findRncpFromCfd(bcnData.result.cfd);

  return {
    result: {
      ...bcnData.result,
      code_rncp: codeRncpUpdated.value,
    },
    messages: {
      ...bcnData.messages,
      code_rncp: codeRncpUpdated.info,
    },
  };
};
module.exports.getDataFromMef10 = getDataFromMef10;
