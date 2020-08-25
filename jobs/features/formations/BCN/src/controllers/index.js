const { infosCodes, computeCodes } = require("./Constants");
const bcnChecker = require("./BcnChecker");
const { difference } = require("lodash");
//const asyncForEach = require("../../../../../common-jobs/utils").asyncForEach;
//const { Formation } = require("../../../../../../common/models");

class BcnControlller {
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

  getDataFromCdf(cdf) {
    if (!cdf) {
      return null;
    }
    const cdfTrimmed = `${cdf}`.trim();
    const cdfUpdated = this.retreiveCDF(cdfTrimmed);

    const niveauUpdated = this.retreiveNiveau(cdfUpdated.value);

    const intituleLongUpdated = this.retreiveIntituleLong(cdfUpdated.value);

    const intituleCourtUpdated = this.retreiveIntituleCourt(cdfUpdated.value);

    const diplomeUpdated = this.retreiveDiplome(cdfUpdated.value);

    // const { update: mef10Updated, trainingsToCreate } = await this.updateMEF10(updatedTraining);
    // const mef8Updated = this.updateMEF8(updatedTraining);
    // const modalitesUpdated = this.updateModalites(updatedTraining);

    return {
      result: {
        cdf: cdfUpdated.value,
        niveau: niveauUpdated.value,
        intitule_long: intituleLongUpdated.value,
        intitule_court: intituleCourtUpdated.value,
        diplome: diplomeUpdated.value,
      },
      messages: {
        cdf: cdfUpdated.message,
        niveau: niveauUpdated.message,
        intitule_long: intituleLongUpdated.message,
        intitule_court: intituleCourtUpdated.message,
        diplome: diplomeUpdated.message,
      },
    };
  }

  retreiveCDF(cdf) {
    const { info, value } = bcnChecker.findCdf(cdf);
    return {
      value,
      message: computeCodes.cdf[info],
    };
  }

  retreiveNiveau(cdf) {
    const { info, value } = bcnChecker.findNiveau(cdf);

    return {
      value,
      message: computeCodes.niveau[info],
    };
  }

  retreiveIntituleLong(cdf) {
    const { info, value } = bcnChecker.findIntituleLong(cdf);

    return {
      value,
      message: computeCodes.intitule[info],
    };
  }

  retreiveIntituleCourt(cdf) {
    const { info, value } = bcnChecker.findIntituleCourt(cdf);

    return {
      value,
      message: computeCodes.intitule[info],
    };
  }

  retreiveDiplome(cdf) {
    const { info, value } = bcnChecker.findDiplome(cdf);

    return {
      value,
      message: computeCodes.diplome[info],
    };
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

  // async updateMEF10(training) {
  //   if (training.educ_nat_code) {
  //     if (training.mef_10_code_updated) {
  //       return { update: false, trainingsToCreate: [] }; // Nothing to do, code MEF10 already updated
  //     }

  //     // Get multi mefs 10
  //     const mefs10FromBcn = bcnChecker.getMefs10(training.educ_nat_code);

  //     if (mefs10FromBcn.length > 1) {
  //       let trainingsToCreate = [];

  //       // Multi mefs10 - match keep psup matching trainings
  //       await asyncForEach(mefs10FromBcn, async currentMef10 => {
  //         const tmpTraining = { ...training, mef_10_code: currentMef10, mef_10_code_updated: true };
  //         this.updateMEF8(tmpTraining);
  //         this.updateModalites(tmpTraining);

  //         // Check matching PSup
  //         const updatesPSupData = await pSupData.getUpdates(tmpTraining, false);
  //         if (updatesPSupData && updatesPSupData.parcoursup_reference === "OUI") {
  //           trainingsToCreate.push(updatesPSupData);
  //         }
  //       });

  //       if (trainingsToCreate.length > 0) {
  //         const trainingsHaveBeenAdded = await Formation.find({
  //           educ_nat_code: training.educ_nat_code,
  //           etablissement_formateur_uai: training.etablissement_formateur_uai,
  //           etablissement_responsable_uai: training.etablissement_responsable_uai,
  //           uai_formation: training.uai_formation,
  //           code_commune_insee: training.code_commune_insee,
  //           code_postal: training.code_postal,
  //           parcoursup_reference: "OUI",
  //           mef_10_code_updated: true,
  //         });
  //         if (trainingsHaveBeenAdded.length > 0) {
  //           training.mef_10_code_updated = true;
  //           return { update: true, trainingsToCreate: [] };
  //         }

  //         // Avoid duplicate training in trainingsToCreate
  //         const tmp = trainingsToCreate[0];
  //         delete tmp._id;
  //         delete tmp.__v;
  //         for (let key in tmp) {
  //           training[key] = tmp[key];
  //         }

  //         trainingsToCreate.shift();

  //         this.countFormations.added += trainingsToCreate.length;

  //         return { update: true, trainingsToCreate };
  //       } else {
  //         // Not found case, we consider that if No pSup match + list of mef10 ==> the training doesn't have a mef10
  //         training.mef_10_codes = mefs10FromBcn;
  //         training.mef_10_code = null;
  //         training.mef_8_code = null;
  //         training.mef_8_codes = [];
  //         return { update: true, trainingsToCreate: [] };
  //       }
  //     } else {
  //       const result = this.updateSingleMEF10(training);
  //       if (result) {
  //         training.mef_10_code_updated = true;
  //       }
  //       return { update: result, trainingsToCreate: [] };
  //     }
  //   }
  //   return { update: false, trainingsToCreate: [] };
  // }

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
}

const bcnControlller = new BcnControlller();
module.exports = bcnControlller;
