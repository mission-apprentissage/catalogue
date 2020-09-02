// #region Imports

const { infosCodes, niveaux, mappingNiveauCodeEn, computeCodes } = require("./Constants");
const { find, filter, uniq } = require("lodash");
const moment = require("moment");
const fileManager = require("./FileManager");
const logger = require("../../../../../common-jobs/Logger").mainLogger;

// #endregion

class BcnController {
  constructor() {
    this.bases = {
      N_FORMATION_DIPLOME: null,
      N_LETTRE_SPECIALITE: null,
      N_NIVEAU_FORMATION_DIPLOME: null,
      N_MEF: null,
      N_DISPOSITIF_FORMATION: null,
    };
    this.basesLoaded = false;
    this.validLimiteDate = moment("31/08/2020", "DD/MM/YYYY");
  }

  load() {
    if (!this.basesLoaded) {
      this.bases = fileManager.loadBases();
      this.basesLoaded = true;
    }
  }

  getDataFromCfd(providedCfd) {
    if (!providedCfd || !/^[0-9A-Z]{8}[A-Z]?$/g.test(providedCfd.trim())) {
      return {
        result: {},
        messages: {
          error: "Le code formation dilpome doit être définit et au format 8 caractères ou 9 avec la lettre specialité",
        },
      };
    }

    let cfd = providedCfd.length === 9 ? providedCfd.substring(0, 8) : providedCfd;
    cfd = `${cfd}`.trim();

    const specialiteUpdated =
      providedCfd.length === 9
        ? this.getSpeciality(providedCfd.substring(8, 9))
        : { info: infosCodes.specialite.NotProvided, value: null };

    const cfdUpdated = this.findCfd(cfd);
    const niveauUpdated = this.findNiveau(cfdUpdated.value);
    const intituleLongUpdated = this.findIntituleLong(cfdUpdated.value);
    const intituleCourtUpdated = this.findIntituleCourt(cfdUpdated.value);
    const diplomeUpdated = this.findDiplome(cfdUpdated.value);

    return {
      result: {
        cfd: cfdUpdated.value,
        specialite: specialiteUpdated.value,
        niveau: niveauUpdated.value,
        intitule_long: intituleLongUpdated.value,
        intitule_court: intituleCourtUpdated.value,
        diplome: diplomeUpdated.value,
      },
      messages: {
        cfd: computeCodes.cfd[cfdUpdated.info],
        specialite: computeCodes.specialite[specialiteUpdated.info],
        niveau: computeCodes.niveau[niveauUpdated.info],
        intitule_long: computeCodes.intitule[intituleLongUpdated.info],
        intitule_court: computeCodes.intitule[intituleCourtUpdated.info],
        diplome: computeCodes.diplome[diplomeUpdated.info],
      },
    };
  }

  getDataFromMef10(providedMef10) {
    if (!providedMef10 || !/^[0-9]{10}$/g.test(providedMef10.trim())) {
      return {
        result: {},
        messages: {
          error: "Le code MEF 10 doit être définit et au format 10 caractères",
        },
      };
    }
    let mef10 = `${providedMef10}`.trim();
    const cfdUpdated = this.findCfdFromMef10(mef10);

    const modalite = this.getModalities(mef10);

    return {
      result: {
        mef10,
        modalite,
        cfd: cfdUpdated.value,
      },
      messages: {
        mef10: computeCodes.mef[cfdUpdated.info],
        cfdUpdated: computeCodes.cfd[cfdUpdated.info],
      },
    };
  }

  getMefsFromCfd(codeEducNat) {
    const Mefs10List = this.findMefs10(codeEducNat);
    const Mefs10Updated = [];
    for (let i = 0; i < Mefs10List.value.length; i++) {
      const mef10 = Mefs10List.value[i];
      const modalite = this.getModalities(mef10);
      Mefs10Updated.push({
        mef10,
        modalite,
      });
    }
    const Mefs8Updated = this.findMefs8(codeEducNat);

    return {
      result: {
        mefs10: Mefs10Updated,
        mefs8: Mefs8Updated.value,
      },
      messages: {
        mefs10: computeCodes.mef[Mefs10List.info],
        mefs8: computeCodes.mef[Mefs8Updated.info],
      },
    };
  }

  getMef10DataFromMefs(mefs) {
    let mef10Data = { result: {}, messages: {} };
    if (mefs.result.mefs10.length === 1) {
      mef10Data = bcnController.getDataFromMef10(mefs.result.mefs10[0].mef10);
      delete mef10Data.result.cfd;
    }
    return mef10Data;
  }

  findCfd(codeEducNat, previousInfo = null) {
    this.load();
    try {
      const match = find(this.bases.N_FORMATION_DIPLOME, { FORMATION_DIPLOME: codeEducNat });

      if (!match) {
        return { info: infosCodes.cfd.NotFound, value: codeEducNat };
      }

      if (match.DATE_FERMETURE === "") {
        // Valide codeEn
        return { info: previousInfo ? previousInfo : infosCodes.cfd.Found, value: codeEducNat };
      }

      const closingDate = moment(match.DATE_FERMETURE, "DD/MM/YYYY");

      if (closingDate.isAfter(this.validLimiteDate)) {
        // Valide codeEn
        return { info: previousInfo ? previousInfo : infosCodes.cfd.Found, value: codeEducNat };
      }

      if (match.NOUVEAU_DIPLOME_7 !== "") {
        return this.findCfd(match.NOUVEAU_DIPLOME_7, infosCodes.cfd.Updated);
      }
      if (match.NOUVEAU_DIPLOME_6 !== "") {
        return this.findCfd(match.NOUVEAU_DIPLOME_6, infosCodes.cfd.Updated);
      }
      if (match.NOUVEAU_DIPLOME_5 !== "") {
        return this.findCfd(match.NOUVEAU_DIPLOME_5, infosCodes.cfd.Updated);
      }
      if (match.NOUVEAU_DIPLOME_4 !== "") {
        return this.findCfd(match.NOUVEAU_DIPLOME_4, infosCodes.cfd.Updated);
      }
      if (match.NOUVEAU_DIPLOME_3 !== "") {
        return this.findCfd(match.NOUVEAU_DIPLOME_3, infosCodes.cfd.Updated);
      }
      if (match.NOUVEAU_DIPLOME_2 !== "") {
        return this.findCfd(match.NOUVEAU_DIPLOME_2, infosCodes.cfd.Updated);
      }
      if (match.NOUVEAU_DIPLOME_1 !== "") {
        return this.findCfd(match.NOUVEAU_DIPLOME_1, infosCodes.cfd.Updated);
      }

      return { info: infosCodes.cfd.OutDated, value: codeEducNat };
    } catch (err) {
      logger.error(err);
      return { info: infosCodes.cfd.NotFound, value: codeEducNat };
    }
  }

  findNiveau(codeEducNat) {
    let code = codeEducNat.startsWith("010") ? codeEducNat.substring(0, 4) : codeEducNat.substring(0, 1);
    let foundNiveau = mappingNiveauCodeEn[code];

    if (foundNiveau) {
      const toText = niveaux[parseInt(foundNiveau) - 3];
      return { info: infosCodes.niveau.NothingDoTo, value: toText };
    } else {
      return { info: infosCodes.niveau.Error, value: null };
    }
  }

  findIntituleLong(codeEducNat) {
    this.load();
    const match = find(this.bases.N_FORMATION_DIPLOME, { FORMATION_DIPLOME: codeEducNat });

    if (!match) {
      return { info: infosCodes.intitule.Error, value: null };
    }

    return { info: infosCodes.intitule.NothingDoTo, value: match.LIBELLE_LONG_200 };
  }

  findIntituleCourt(codeEducNat) {
    this.load();
    const match = find(this.bases.N_FORMATION_DIPLOME, { FORMATION_DIPLOME: codeEducNat });

    if (!match) {
      return { info: infosCodes.intitule.Error, value: null };
    }

    return { info: infosCodes.intitule.NothingDoTo, value: match.LIBELLE_STAT_33 };
  }

  findDiplome(codeEducNat) {
    const tronc = codeEducNat.substring(0, 3);
    const match = find(this.baseNiveauFormationDiplome, { NIVEAU_FORMATION_DIPLOME: tronc });

    if (!match) {
      return { info: infosCodes.diplome.Error, value: null };
    }

    return { info: infosCodes.diplome.NothingDoTo, value: match.LIBELLE_100 };
  }

  findCfdFromMef10(mef10) {
    this.load();
    const match = filter(this.bases.N_MEF, { MEF: mef10 });
    if (!match.length) {
      return { info: infosCodes.mef.NotFound, value: null };
    }

    const result = match.map(m => `${m.FORMATION_DIPLOME}`);
    if (result.length > 1) {
      return { info: infosCodes.mef.Multiple, value: null };
    }
    return { info: infosCodes.mef.NothingDoTo, value: result[0] };
  }

  findMefs10(codeEducNat) {
    this.load();
    const match = filter(this.bases.N_MEF, { FORMATION_DIPLOME: codeEducNat });
    if (!match.length) {
      return { info: infosCodes.mef.NotFound, value: [] };
    }
    return { info: infosCodes.mef.NothingDoTo, value: match.map(m => `${m.MEF}`) };
  }

  findMefs8(codeEducNat) {
    this.load();
    const match = filter(this.bases.N_MEF, { FORMATION_DIPLOME: codeEducNat });

    if (!match.length) {
      return { info: infosCodes.mef.NotFound, value: [] };
    }
    const result = match.map(m => `${m.DISPOSITIF_FORMATION}${codeEducNat.substring(3, codeEducNat.length)}`);
    return {
      info: infosCodes.mef.NothingDoTo,
      value: uniq(result),
    };
  }

  getModalities(mef_10_code) {
    return {
      duree: mef_10_code !== "" ? mef_10_code.substring(8, 9) : "",
      annee: mef_10_code !== "" ? mef_10_code.substring(9, 10) : "",
    };
  }

  getSpeciality(specialityLetter) {
    this.load();
    try {
      const specialityData = this.bases.N_LETTRE_SPECIALITE.find(
        item => item.LETTRE_SPECIALITE.trim() === specialityLetter
      );
      return {
        info: infosCodes.specialite.NothingDoTo,
        value: {
          lettre: specialityLetter,
          libelle: specialityData ? specialityData.LIBELLE_LONG : null,
          libelle_court: specialityData ? specialityData.LIBELLE_COURT : null,
        },
      };
    } catch (err) {
      logger.error(err);
      return { info: infosCodes.specialite.Error, value: null };
    }
  }
}

const bcnController = new BcnController();
module.exports = bcnController;
