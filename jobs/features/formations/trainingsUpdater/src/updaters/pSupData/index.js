const logger = require("../../../../../../common-jobs/Logger").mainLogger;
const { infosCodes } = require("./Constants");
const pSupChecker = require("./pSupChecker");

class BcnData {
  constructor() {
    this.countPsup = { uniq: 0, multiple: 0, notFound: 0 };
  }

  async getUpdates(training) {
    let updatedTraining = {
      ...training,
    };

    const pSupUpdated = this.findAndUpdates(updatedTraining);

    if (!pSupUpdated) {
      return null;
    }

    return updatedTraining;
  }

  findAndUpdates(training) {
    const {
      mef_10_code,
      mef_8_code,
      mef_8_codes,
      etablissement_formateur_uai,
      etablissement_responsable_uai,
      uai_formation,
      code_commune_insee,
      code_postal,
    } = training;

    if (!mef_10_code && !mef_8_code && mef_8_codes.length === 0) {
      return false;
    }

    // TODO no Updates detection

    const { info: infoPSup } = pSupChecker.findFormation(
      mef_10_code,
      mef_8_code,
      [etablissement_formateur_uai, etablissement_responsable_uai, uai_formation],
      code_commune_insee,
      code_postal
    );

    if (infoPSup === infosCodes.psup.Found) {
      this.countPsup.uniq++;
      training.parcoursup_reference = "OUI";
    } else if (infoPSup === infosCodes.psup.FoundMultiple) {
      this.countPsup.multiple++; // Goal to be 0
    } else if (infoPSup === infosCodes.psup.NotFound) {
      this.countPsup.notFound++;
      training.parcoursup_reference = "NON";
    }

    return true;
  }

  stats() {
    if (pSupChecker.baseFormation) {
      logger.info(`${pSupChecker.baseFormation.length} formations psup fournies`);
    }
    logger.info(`${this.countPsup.uniq} psup trouvés Unique`);
    logger.info(`${this.countPsup.multiple} psup trouvés multiple`);
    logger.info(`${this.countPsup.notFound} Psup non trouvés`);
  }
}

const bcnData = new BcnData();
module.exports = bcnData;
