const logger = require("../../../../../common/Logger").mainLogger;
const { isValidCodePostal, zipCodeExist } = require("../utils/validation");
const { formatCodePostal } = require("../utils/formating");

class LocationData {
  constructor() {}

  getUpdates(training) {
    const numDepartement = this.numDepartement(training);
    const codePostal = this.codePostal(training);
    // Todo handle case no update needed
    return {
      num_departement: numDepartement,
      code_postal: codePostal,
    };
  }

  codePostal(training) {
    const { code_postal } = training;
    const cp = formatCodePostal(code_postal);
    if (!isValidCodePostal(cp)) {
      // First code to fix, 4 digits instead of 5 (due to str to int cast)
      if (/^[0-9]{4}$/g.test(cp)) {
        const fixZip = `0${cp}`;
        if (zipCodeExist({ code_postal: cp })) {
          return fixZip;
        } else {
          const isCCInsee = !!zipCodeExist({ code_commune_insee: fixZip });
          logger.info(`${fixZip} est un code commune insee ${isCCInsee}`);
        }
      }
    }
    return code_postal !== "" ? code_postal : null;
  }

  numDepartement(training) {
    const cp = formatCodePostal(training.code_postal);
    if (!isValidCodePostal(cp)) {
      logger.info(`Training ${training._id} has invalid code_postal`);
      return null;
    }
    return cp !== "" ? cp.substring(0, 2) : null;
  }
}

const locationData = new LocationData();
module.exports = locationData;
