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

    const Mefs10List = this.retreiveMefs10(cdfUpdated.value);
    const Mefs10Updated = [];
    for (let i = 0; i < Mefs10List.value.length; i++) {
      const mef10 = Mefs10List.value[i];
      const modalite = this.retreiveModalites(mef10);
      Mefs10Updated.push({
        mef10,
        modalite,
      });
    }

    const Mefs8Updated = this.retreiveMefs8(cdfUpdated.value);

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
        mefs10: Mefs10Updated,
        mefs8: Mefs8Updated.value,
      },
      messages: {
        cdf: cdfUpdated.message,
        niveau: niveauUpdated.message,
        intitule_long: intituleLongUpdated.message,
        intitule_court: intituleCourtUpdated.message,
        diplome: diplomeUpdated.message,
        mefs10: Mefs10List.message,
        mefs8: Mefs8Updated.message,
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

  retreiveMefs10(cdf) {
    const { info, value } = bcnChecker.findMefs10(cdf);
    return {
      value,
      message: computeCodes.mef[info],
    };
  }

  retreiveMefs8(cdf) {
    const { info, value } = bcnChecker.findMefs8(cdf);
    return {
      value,
      message: computeCodes.mef[info],
    };
  }

  retreiveModalites(mef10) {
    const { duree, annee } = bcnChecker.getModalities(mef10);
    return { duree, annee };
  }
}

const bcnControlller = new BcnControlller();
module.exports = bcnControlller;
