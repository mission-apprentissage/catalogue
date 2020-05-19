const logger = require("../../../../../../common-jobs/Logger").mainLogger;
const { infosCodes } = require("./Constants");
const affelnetChecker = require("./affelnetChecker");

class AffelnetData {
  constructor() {
    this.countAffelnet = { uniq: 0, multiple: 0, notFound: 0, perfect: 0, super: 0 };
    this.countMef = 0;
  }

  async getUpdates(training, count = true) {
    let updatedTraining = {
      ...training,
    };

    const affelnetUpdated = this.findAndUpdates(updatedTraining, count);

    if (!affelnetUpdated) {
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
      intitule_court,
      nom_academie,
    } = training;

    // if (!mef_10_code) {
    //   // && !mef_8_code && mef_8_codes.length === 0
    //   return false;
    // }

    //this.countMef++;

    const { info: infoAffelnet } = affelnetChecker.findFormation(
      mef_10_code,
      mef_8_code,
      [etablissement_formateur_uai, etablissement_responsable_uai, uai_formation],
      code_commune_insee,
      code_postal,
      intitule_court,
      nom_academie
    );

    if (infoAffelnet === infosCodes.affelnet.FoundPerfect) {
      if (count) this.countAffelnet.perfect++;
      //training.affelnet_reference = "OUI";
    } else if (infoAffelnet === infosCodes.affelnet.FoundSuper) {
      if (count) this.countAffelnet.super++;
      //training.affelnet_reference = "OUI";
    } else if (infoAffelnet === infosCodes.affelnet.Found) {
      if (count) this.countAffelnet.uniq++;
      //training.affelnet_reference = "OUI";
    } else if (infoAffelnet === infosCodes.affelnet.FoundMultiple) {
      if (count) this.countAffelnet.multiple++; // Goal to be 0
    } else if (infoAffelnet === infosCodes.affelnet.NotFound) {
      if (count) this.countAffelnet.notFound++;
      //training.affelnet_reference = "NON";
    }

    return false;
  }

  stats() {
    if (affelnetChecker.baseFormation) {
      logger.info(`${affelnetChecker.baseFormation.length} formations affelnet fournies`);
    }
    //logger.info(`${this.countMef} ont des codes mefs`);
    logger.info(
      `${this.countAffelnet.perfect + this.countAffelnet.super + this.countAffelnet.uniq} affelnet trouvés unique`
    );
    logger.info(`${this.countAffelnet.perfect} affelnet trouvés très bon`);
    logger.info(`${this.countAffelnet.super} affelnet trouvés bon`);
    logger.info(`${this.countAffelnet.uniq} affelnet trouvés `);
    logger.info(`${this.countAffelnet.multiple} affelnet trouvés multiple`);
    logger.info(`${this.countAffelnet.notFound} affelnet non trouvés`);
  }
}

const affelnetData = new AffelnetData();
module.exports = affelnetData;
