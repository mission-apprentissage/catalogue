const bcnController = require("../controllers/bcn/bcnController");

const getModaliteFromMef10 = providedMef10 => {
  return bcnController.getModalities(providedMef10);
};
module.exports.getModaliteFromMef10 = getModaliteFromMef10;
