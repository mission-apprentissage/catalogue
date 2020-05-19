const logger = require("../../../../../../common-jobs/Logger").mainLogger;
const { infosCodes } = require("./Constants");
const affelnetChecker = require("./affelnetChecker");

class BcnData {
  constructor() {
    this.countAffelnet = { uniq: 0, multiple: 0, notFound: 0 };
  }

  async getUpdates(training, count = true) {
    let updatedTraining = {
      ...training,
    };

    const pSupUpdated = this.findAndUpdates(updatedTraining, count);

    if (!pSupUpdated) {
      return null;
    }

    return updatedTraining;
  }

  findAndUpdates(training, count) {
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

    const { info: infoPSup } = affelnetChecker.findFormation(
      mef_10_code,
      mef_8_code,
      [etablissement_formateur_uai, etablissement_responsable_uai, uai_formation],
      code_commune_insee,
      code_postal
    );

    if (infoPSup === infosCodes.affelnet.Found) {
      if (count) this.countAffelnet.uniq++;
      training.affelnet_reference = "OUI";
    } else if (infoPSup === infosCodes.affelnet.FoundMultiple) {
      if (count) this.countAffelnet.multiple++; // Goal to be 0
    } else if (infoPSup === infosCodes.affelnet.NotFound) {
      if (count) this.countAffelnet.notFound++;
      training.affelnet_reference = "NON";
    }

    return true;
  }

  stats() {
    if (affelnetChecker.baseFormation) {
      logger.info(`${affelnetChecker.baseFormation.length} formations affelnet fournies`);
    }
    logger.info(`${this.countAffelnet.uniq} affelnet trouvés Unique`);
    logger.info(`${this.countAffelnet.multiple} affelnet trouvés multiple`);
    logger.info(`${this.countAffelnet.notFound} affelnet non trouvés`);
  }
}

const bcnData = new BcnData();
module.exports = bcnData;
