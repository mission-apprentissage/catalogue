const logger = require("../../../../../../common/Logger").mainLogger;
const { infosCodes, computeCodes } = require("./Constants");
const bcnChecker = require("./BcnChecker");
const { difference } = require("lodash");

class BcnData {
  constructor() {
    this.countCodeEn = { ok: 0, ko: 0 };
    this.countNiveau = { update: 0 };
    this.countIntitule = { update: 0 };
    this.countDiplome = { update: 0 };
    this.countMef10 = { update: 0 };
    this.countMef8 = { update: 0 };
  }

  async getUpdates(training) {
    let updatedTraining = {
      ...training,
    };

    const codeEnUpdated = this.cleaningCodeEn(updatedTraining);
    const niveauUpdated = this.cleaningNiveau(updatedTraining);
    const intituleUpdated = this.cleaningIntitule(updatedTraining);
    const diplomeUpdated = this.cleaningDiplome(updatedTraining);
    const mef10Updated = this.updateMEF10(updatedTraining);
    const mef8Updated = this.updateMEF8(updatedTraining);

    if (!codeEnUpdated && !niveauUpdated && !intituleUpdated && !diplomeUpdated && !mef10Updated && !mef8Updated) {
      return null;
    }

    return updatedTraining;
  }

  cleaningCodeEn(training) {
    const codeEn = `${training.educ_nat_code}`.trim();
    const { info: infoCodeEN, value: valueCodeEN } = bcnChecker.cleanCodeEn(codeEn);

    if (
      training.info_bcn_code_en === infoCodeEN &&
      training.computed_bcn_code_en === computeCodes.codeEnExistBCN[infoCodeEN] &&
      training.educ_nat_code === valueCodeEN
    ) {
      return false;
    }

    training.info_bcn_code_en = infoCodeEN;
    training.computed_bcn_code_en = computeCodes.codeEnExistBCN[infoCodeEN];
    if (infoCodeEN === infosCodes.codeEnExistBCN.OutDated || infoCodeEN === infosCodes.codeEnExistBCN.NotFound) {
      if (codeEn !== "") {
        this.countCodeEn.ko++;
        // console.log(codeEn);
      }
    } else if (infoCodeEN === infosCodes.codeEnExistBCN.Found || infoCodeEN === infosCodes.codeEnExistBCN.Updated) {
      training.educ_nat_code = valueCodeEN;
      this.countCodeEn.ok++;
    }
    return true;
  }

  cleaningNiveau(training) {
    if (training.educ_nat_code) {
      const { info: infoNiveau, value: valueNiveau } = bcnChecker.cleanNiveau(training.educ_nat_code, training.niveau);

      if (
        training.info_bcn_niveau === infoNiveau &&
        training.info_bcn_niveau !== "" &&
        training.computed_bcn_niveau === computeCodes.niveau[infoNiveau] &&
        training.computed_bcn_niveau !== "" &&
        training.niveau === valueNiveau
      ) {
        return false;
      }

      training.info_bcn_niveau = infoNiveau;
      training.computed_bcn_niveau = computeCodes.niveau[infoNiveau];
      if (infoNiveau === infosCodes.niveau.Updated) {
        this.countNiveau.update++;
        training.niveau = valueNiveau;
      }
      return true;
    }
    return false;
  }

  cleaningIntitule(training) {
    const { info: infoIntitule, value: valueIntitule } = bcnChecker.cleanIntitule(
      training.educ_nat_code,
      `${training.intitule}`.trim()
    );

    if (
      training.info_bcn_intitule === infoIntitule &&
      training.computed_bcn_intitule === computeCodes.intitule[infoIntitule] &&
      training.intitule === valueIntitule
    ) {
      return false;
    }

    training.info_bcn_intitule = infoIntitule;
    training.computed_bcn_intitule = computeCodes.intitule[infoIntitule];
    if (infoIntitule === infosCodes.intitule.Updated) {
      this.countIntitule.update++;
      training.intitule = valueIntitule;
    }

    return true;
  }

  cleaningDiplome(training) {
    if (training.educ_nat_code) {
      const { info: infoDiplome, value: valueDiplome } = bcnChecker.cleanDiplome(
        training.educ_nat_code,
        `${training.diplome}`.trim()
      );

      if (
        training.info_bcn_diplome === infoDiplome &&
        training.computed_bcn_diplome === computeCodes.diplome[infoDiplome] &&
        training.diplome === valueDiplome
      ) {
        return false;
      }

      training.info_bcn_diplome = infoDiplome;
      training.computed_bcn_diplome = computeCodes.diplome[infoDiplome];
      if (infoDiplome === infosCodes.diplome.Updated) {
        this.countDiplome.update++;
        training.diplome = valueDiplome;
      }
      return true;
    }
    return false;
  }

  updateMEF10(training) {
    if (training.educ_nat_code) {
      const { info: infoMef10, value: valueMef10 } = bcnChecker.getMef10(training.educ_nat_code, training.mef_10_code);
      const { duree, annee } = bcnChecker.getModalities(valueMef10);

      if (
        training.info_bcn_mef === infoMef10 &&
        training.computed_bcn_mef === computeCodes.mef[infoMef10] &&
        training.mef_10_code === valueMef10 &&
        training.duree === duree &&
        training.annee === annee
      ) {
        return false;
      }

      training.info_bcn_mef = infoMef10;
      training.computed_bcn_mef = computeCodes.mef[infoMef10];
      training.duree = duree;
      training.annee = annee;
      if (infoMef10 === infosCodes.mef.Updated) {
        this.countMef10.update++;
        training.mef_10_code = valueMef10;
      }
      return true;
    }
    return false;
  }

  updateMEF8(training) {
    if (training.educ_nat_code) {
      const { educ_nat_code, mef_10_code, mef_8_codes, mef_8_code } = training;
      const mef8List = bcnChecker.getMefs8(educ_nat_code);
      const tronc = mef_10_code.substring(0, 8);
      const isUniq = mef8List.length === 1;

      if (
        difference(mef8List, mef_8_codes).length === 0 &&
        // mef_10_code !== "" &&
        (mef_8_code === tronc || (isUniq && mef_8_code === mef8List[0]))
      ) {
        return false;
      }

      this.countMef8.update++;
      training.mef_8_codes = mef8List;

      if (isUniq) {
        training.mef_8_code = mef8List[0];
        return true;
      }

      if (mef8List.includes(tronc)) {
        training.mef_8_code = tronc;
        return true;
      }

      training.mef_8_code = "";

      return true;
    }
    return false;
  }

  stats() {
    logger.info(`${this.countCodeEn.ok} CodeEn trouvés ou mis à jour`);
    logger.info(`${this.countCodeEn.ko} CodeEn non trouvés ou périmés`);
    logger.info(`${this.countNiveau.update} Niveaux mis à jour`);
    logger.info(`${this.countIntitule.update} Intitulés mis à jour`);
    logger.info(`${this.countDiplome.update} Diplomes mis à jour`);
    logger.info(`${this.countMef10.update} MEF 10 mis à jour`);
    logger.info(`${this.countMef8.update} MEF 8 mis à jour`);
  }
}

const bcnData = new BcnData();
module.exports = bcnData;
