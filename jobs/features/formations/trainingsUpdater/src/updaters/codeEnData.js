const logger = require("../../../../../common/Logger").mainLogger;
const fileManager = require("../updaters/bcnData/FileManager");
const { PATH_SPECIALITE } = require("../updaters/bcnData/Constants");

class CodeEnData {
  constructor() {
    this.countCodeEn9 = 0;
    this.countCodeEn8 = 0;
    this.baseSpecialite = fileManager.getDataSpecialiteFromFile(PATH_SPECIALITE);
  }

  getUpdates(training) {
    let updatedTraining = {
      ...training,
    };

    const codeEnUpdated = this.cleaningCodeEn(updatedTraining);

    if (!codeEnUpdated) {
      return null;
    }

    return updatedTraining;
  }

  cleaningCodeEn(training) {
    if (!training.educ_nat_code) {
      return false;
    }
    const codeEn = `${training.educ_nat_code}`.trim();

    let newCode = codeEn;
    let newSpeciality = null;
    switch (codeEn.length) {
      case 9:
        newCode = codeEn.substring(0, 8);
        newSpeciality = this.getSpeciality(codeEn.substring(8, 9));
        this.countCodeEn9++;
        break;
      case 7:
        newCode = this.fixMissingFirstCharacter(codeEn);
        break;
      case 8:
      default:
        this.countCodeEn8++;
        break;
    }

    if (newCode !== training.educ_nat_code || newSpeciality) {
      training.educ_nat_code = newCode;
      if (newSpeciality.letter !== training.educ_nat_speciality_letter) {
        training.educ_nat_specialite_lettre = newSpeciality.letter;
        training.educ_nat_specialite_libelle = newSpeciality.label;
        training.educ_nat_specialite_libelle_court = newSpeciality.shortLabel;
      }
      return true;
    }

    return false;
  }

  fixMissingFirstCharacter(codeEn) {
    // First code to fix, 7 digits instead of 8 (due to str to int cast) losing 0
    if (/^[0-9A-Z]{7}$/g.test(codeEn)) {
      const fixCodeEn = `0${codeEn}`;
      return fixCodeEn;
    }
    return codeEn;
  }

  getSpeciality(specialityLetter) {
    try {
      const specialityData = this.baseSpecialite.find(item => item.LETTRE_SPECIALITE.trim() === specialityLetter);
      return {
        letter: specialityLetter,
        label: specialityData ? specialityData.LIBELLE_LONG : null,
        shortLabel: specialityData ? specialityData.LIBELLE_COURT : null,
      };
    } catch (err) {
      logger.error(err);
      return null;
    }
  }

  stats() {
    logger.info(`${this.countCodeEn9} CodeEn sur 9 caracteres`);
    logger.info(`${this.countCodeEn8} CodeEn sur 8 caracteres`);
  }
}

const codeEnData = new CodeEnData();
module.exports = codeEnData;
