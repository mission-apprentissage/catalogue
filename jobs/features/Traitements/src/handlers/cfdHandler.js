const bcnController = require("../controllers/bcn/bcnController");
const fcController = require("../controllers/fc/fcController");

const getDataFromCfd = providedCfd => {
  const bcnData = bcnController.getDataFromCfd(providedCfd);

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
module.exports.getDataFromCfd = getDataFromCfd;
