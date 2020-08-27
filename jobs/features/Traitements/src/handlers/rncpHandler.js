const fcController = require("../controllers/fc/fcController");
const bcnController = require("../controllers/bcn/bcnController");

const getDataFromRncp = providedRncp => {
  if (!providedRncp || !/^(RNCP)?[0-9]{5}$/g.test(providedRncp.trim())) {
    return {
      result: {},
      messages: {
        error: "Le code RNCP doit être définit et au format 5 ou 9 caractères,  RNCP24440 ou 24440",
      },
    };
  }

  let rncp = `${providedRncp}`.trim();
  if (rncp.length === 5) rncp = `RNCP${rncp}`;

  const cfdUpdated = fcController.findCfdFromRncp(rncp);
  const bcnData = bcnController.getDataFromCfd(cfdUpdated.value);

  return {
    result: {
      cfd: cfdUpdated.value,
      ...bcnData.result,
      code_rncp: rncp,
    },
    messages: {
      cfd: cfdUpdated.info,
      ...bcnData.messages,
      code_rncp: cfdUpdated.info,
    },
  };
};
module.exports.getDataFromRncp = getDataFromRncp;
