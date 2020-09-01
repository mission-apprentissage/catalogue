const entrepriseController = require("../controllers/entrepriseController");

const getDataFromSiret = async providedSiret => {
  const siretData = await entrepriseController.findDataFromSiret(providedSiret);

  return {
    result: {
      ...siretData.result,
    },
    messages: {
      ...siretData.messages,
    },
  };
};
module.exports.getDataFromSiret = getDataFromSiret;
