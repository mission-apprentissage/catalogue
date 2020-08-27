const bcnController = require("../controllers/bcn/bcnController");
//const fcController = require("../controllers/fc/fcController");

const getDataFromMef10 = providedMef10 => {
  const r = bcnController.findCfdFromMef10(providedMef10);
  // r.value[0]
  //console.log(r);
  const bcnData = bcnController.getDataFromCfd(r.value[0]);
  //bcnController.getModalities(providedMef10);

  return {
    result: {
      cfd: r.value[0],
      ...bcnData.result,
    },
    messages: {
      cfd: r.info,
      ...bcnData.messages,
    },
  };
};
module.exports.getDataFromMef10 = getDataFromMef10;
