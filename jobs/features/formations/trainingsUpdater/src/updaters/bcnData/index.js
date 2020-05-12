const logger = require("../../../../../../common-jobs/Logger").mainLogger;
const { infosCodes, computeCodes } = require("./Constants");
const bcnChecker = require("./BcnChecker");
const { difference } = require("lodash");
const asyncForEach = require("../../../../../../common-jobs/utils").asyncForEach;
const pSupData = require("../pSupData");
const { Formation } = require("../../../../../../common-jobs/models");
class BcnData {
  constructor() {
    this.countCodeEn = { ok: 0, ko: 0 };
    this.countNiveau = { update: 0 };
    this.countIntituleLong = { update: 0 };
    this.countIntituleCourt = { update: 0 };
    this.countDiplome = { update: 0 };
    this.countMef10 = { update: 0 };
    this.countMef8 = { update: 0 };
    this.countModalites = { update: 0 };
    this.countFormations = { added: 0 };
  }

  async getUpdates(training) {
    let updatedTraining = {
      ...training,
    };

    const codeEnUpdated = this.cleaningCodeEn(updatedTraining);
    const niveauUpdated = this.cleaningNiveau(updatedTraining);
    const intituleLongUpdated = this.cleaningIntituleLong(updatedTraining);
    const intituleCourtUpdated = this.cleaningIntituleCourt(updatedTraining);
    const diplomeUpdated = this.cleaningDiplome(updatedTraining);

    const { update: mef10Updated, trainingsToCreate } = await this.updateMEF10(updatedTraining);
    const mef8Updated = this.updateMEF8(updatedTraining);
    const modalitesUpdated = this.updateModalites(updatedTraining);

    if (
      !codeEnUpdated &&
      !niveauUpdated &&
      !intituleLongUpdated &&
      !intituleCourtUpdated &&
      !diplomeUpdated &&
      !modalitesUpdated &&
      !mef10Updated &&
      !mef8Updated
    ) {
      return { updatedTraining: null, trainingsToCreate: [] };
    }

    return {
      updatedTraining,
      trainingsToCreate,
    };
  }

  cleaningCodeEn(training) {
    if (!training.educ_nat_code) {
      return false;
    }
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

  cleaningIntituleLong(training) {
    const { info: infoIntituleLong, value: valueIntituleLong } = bcnChecker.cleanIntituleLong(
      training.educ_nat_code,
      training.intitule_long ? `${training.intitule_long}`.trim() : null,
      training.intitule
    );

    if (
      training.info_bcn_intitule_long === infoIntituleLong &&
      training.computed_bcn_intitule_long === computeCodes.intitule[infoIntituleLong] &&
      training.intitule_long === valueIntituleLong
    ) {
      return false;
    }

    training.info_bcn_intitule_long = infoIntituleLong;
    training.computed_bcn_intitule_long = computeCodes.intitule[infoIntituleLong];
    if (infoIntituleLong === infosCodes.intitule.Updated) {
      this.countIntituleLong.update++;
    }
    training.intitule_long = valueIntituleLong;

    return true;
  }

  cleaningIntituleCourt(training) {
    const { info: infoIntituleCourt, value: valueIntituleCourt } = bcnChecker.cleanIntituleCourt(
      training.educ_nat_code,
      training.intitule_court ? `${training.intitule_court}`.trim() : null
    );

    if (
      training.info_bcn_intitule_court === infoIntituleCourt &&
      training.computed_bcn_intitule_court === computeCodes.intitule[infoIntituleCourt] &&
      training.intitule_court === valueIntituleCourt
    ) {
      return false;
    }

    training.info_bcn_intitule_court = infoIntituleCourt;
    training.computed_bcn_intitule_court = computeCodes.intitule[infoIntituleCourt];
    if (infoIntituleCourt === infosCodes.intitule.Updated) {
      this.countIntituleCourt.update++;
      training.intitule_court = valueIntituleCourt;
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

  updateModalites(training) {
    if (training.mef_10_code) {
      const { duree, annee } = bcnChecker.getModalities(training.mef_10_code);

      if (training.duree === duree && training.annee === annee) {
        return false;
      }

      training.duree = duree;
      training.annee = annee;
      this.countModalites.update++;
      return true;
    }
    return false;
  }

  async updateMEF10(training) {
    if (training.educ_nat_code) {
      if (training.mef_10_code_updated) {
        return { update: false, trainingsToCreate: [] }; // Nothing to do, code MEF10 already updated
      }

      // Get multi mefs 10
      const mefs10FromBcn = bcnChecker.getMefs10(training.educ_nat_code);

      if (mefs10FromBcn.length > 1) {
        let trainingsToCreate = [];

        // Multi mefs10 - match keep psup matching trainings
        await asyncForEach(mefs10FromBcn, async currentMef10 => {
          const tmpTraining = { ...training, mef_10_code: currentMef10, mef_10_code_updated: true };
          this.updateMEF8(tmpTraining);
          this.updateModalites(tmpTraining);

          // Check matching PSup
          const updatesPSupData = await pSupData.getUpdates(tmpTraining, false);
          if (updatesPSupData && updatesPSupData.parcoursup_reference === "OUI") {
            trainingsToCreate.push(updatesPSupData);
          }
        });

        if (trainingsToCreate.length > 0) {
          const trainingsHaveBeenAdded = await Formation.find({
            educ_nat_code: training.educ_nat_code,
            etablissement_formateur_uai: training.etablissement_formateur_uai,
            etablissement_responsable_uai: training.etablissement_responsable_uai,
            uai_formation: training.uai_formation,
            code_commune_insee: training.code_commune_insee,
            code_postal: training.code_postal,
            parcoursup_reference: "OUI",
            mef_10_code_updated: true,
          });
          if (trainingsHaveBeenAdded.length > 0) {
            training.mef_10_code_updated = true;
            return { update: true, trainingsToCreate: [] };
          }

          // Avoid duplicate training in trainingsToCreate
          const tmp = trainingsToCreate[0];
          delete tmp._id;
          delete tmp.__v;
          for (let key in tmp) {
            training[key] = tmp[key];
          }

          trainingsToCreate.shift();

          this.countFormations.added += trainingsToCreate.length;

          return { update: true, trainingsToCreate };
        } else {
          // Not found case, we consider that if No pSup match + list of mef10 ==> the training doesn't have a mef10
          training.mef_10_codes = mefs10FromBcn;
          training.mef_10_code = null;
          training.mef_8_code = null;
          training.mef_8_codes = [];
          return { update: true, trainingsToCreate: [] };
        }
      } else {
        const result = this.updateSingleMEF10(training);
        if (result) {
          training.mef_10_code_updated = true;
        }
        return { update: result, trainingsToCreate: [] };
      }
    }
    return { update: false, trainingsToCreate: [] };
  }

  updateSingleMEF10(training) {
    if (training.educ_nat_code) {
      const { info: infoMef10, value: valueMef10 } = bcnChecker.getMef10(training.educ_nat_code, training.mef_10_code);

      if (
        training.info_bcn_mef === infoMef10 &&
        training.computed_bcn_mef === computeCodes.mef[infoMef10] &&
        training.mef_10_code === valueMef10
      ) {
        return false;
      }

      training.info_bcn_mef = infoMef10;
      training.computed_bcn_mef = computeCodes.mef[infoMef10];
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
      const tronc = mef_10_code ? mef_10_code.substring(0, 8) : "";
      const isUniq = mef8List.length === 1;

      if (
        difference(mef8List, mef_8_codes).length === 0 &&
        // mef_10_code !== null &&
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

      training.mef_8_code = null;

      return true;
    }
    return false;
  }

  stats() {
    logger.info(`${this.countCodeEn.ok} CodeEn trouvés ou mis à jour`);
    logger.info(`${this.countCodeEn.ko} CodeEn non trouvés ou périmés`);
    logger.info(`${this.countNiveau.update} Niveaux mis à jour`);
    logger.info(`${this.countIntituleLong.update} Intitulés long mis à jour`);
    logger.info(`${this.countIntituleCourt.update} Intitulés court mis à jour`);
    logger.info(`${this.countDiplome.update} Diplomes mis à jour`);
    logger.info(`${this.countMef10.update} MEF 10 mis à jour`);
    logger.info(`${this.countMef8.update} MEF 8 mis à jour`);
    logger.info(`${this.countModalites.update} Modalites mises à jour`);
    logger.info(`${this.countFormations.added} formations ajoutées`);
  }
}

const bcnData = new BcnData();
module.exports = bcnData;
