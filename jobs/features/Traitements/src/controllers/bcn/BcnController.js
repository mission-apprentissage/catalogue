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
      V_FORMATION_DIPLOME: null,
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

    // Si  non trouvé dans la table N_FORMATION_DIPLOME on recherche dans la base V_FORMATION_DIPLOME
    let lookupBase = "N";
    let cfdUpdated = this.findCfd_nformation(cfd);
    let infoCfd = `${computeCodes.cfd[cfdUpdated.info]} base N_FORMATION_DIPLOME`;
    if (cfdUpdated.value === null) {
      cfdUpdated = this.findCfd_vformation(cfd);
      lookupBase = "V";
      infoCfd += `, ${computeCodes.cfd[cfdUpdated.info]} base V_FORMATION_DIPLOME`;
    }

    if (cfdUpdated.value === null) {
      return {
        result: {
          cfd: cfd,
          specialite: null,
          niveau: null,
          intitule_long: null,
          intitule_court: null,
          diplome: null,
        },
        messages: {
          cfd: infoCfd,
          specialite: "Erreur",
          niveau: "Erreur",
          intitule_long: "Erreur",
          intitule_court: "Erreur",
          diplome: "Erreur",
        },
      };
    }

    const niveauUpdated = this.findNiveau(cfdUpdated.value);
    const intituleLongUpdated = this.findIntituleLong(cfdUpdated.value, lookupBase);
    const intituleCourtUpdated = this.findIntituleCourt(cfdUpdated.value, lookupBase);
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
        cfd: infoCfd,
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
    const Mefs10List = this.findMefsFromCfd(codeEducNat);

    const MefsUpdated = [];
    for (let i = 0; i < Mefs10List.value.length; i++) {
      const mef10 = Mefs10List.value[i];
      const modalite = this.getModalities(mef10);
      MefsUpdated.push({
        mef10,
        modalite,
      });
    }

    const MefsAproximation = { info: "", value: [] };
    if (MefsUpdated.length === 0) {
      const Mefs11List = this.findMefs11(codeEducNat);
      for (let i = 0; i < Mefs11List.value.length; i++) {
        const mef11 = Mefs11List.value[i];
        const mefTmp = this.findMefFromMef11(mef11);
        const modalite = this.getModalities(mefTmp.value);
        const cfd = this.findCfdFromMef10(mefTmp.value);
        MefsAproximation.value.push({
          mef10: mefTmp.value,
          modalite,
          cfd,
        });
      }
      MefsAproximation.info = "Ces code Mef sont une approximation, les plus proches du code CFD fournit";
    }

    const Mefs8Updated = this.findMefs8(codeEducNat);

    return {
      result: {
        mefs10: MefsUpdated,
        mefs8: Mefs8Updated.value,
        mefsAproximation: MefsAproximation.value,
      },
      messages: {
        mefs10: computeCodes.mef[Mefs10List.info],
        mefs8: computeCodes.mef[Mefs8Updated.info],
        mefsAproximation: MefsAproximation.info,
      },
    };
  }

  getUniqMefFromMefs(mefs) {
    let mef10Data = { result: {}, messages: {} };
    if (mefs.result.mefs10.length === 1) {
      mef10Data = bcnController.getDataFromMef10(mefs.result.mefs10[0].mef10);
      delete mef10Data.result.cfd;
    }
    return mef10Data;
  }

  findCfd_nformation(codeEducNat, previousInfo = null) {
    this.load();
    try {
      const match = find(this.bases.N_FORMATION_DIPLOME, { FORMATION_DIPLOME: codeEducNat });

      if (!match) {
        return { info: infosCodes.cfd.NotFound, value: null };
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
      return { info: infosCodes.cfd.NotFound, value: null };
    }
  }

  findCfd_vformation(codeEducNat) {
    try {
      const match = find(this.bases.V_FORMATION_DIPLOME, { FORMATION_DIPLOME: codeEducNat });
      if (!match) {
        return { info: infosCodes.cfd.NotFound, value: null };
      }

      if (match.DATE_FERMETURE === "") {
        // Valide codeEn
        return { info: infosCodes.cfd.Found, value: codeEducNat };
      }

      const closingDate = moment(match.DATE_FERMETURE, "DD/MM/YYYY");

      if (closingDate.isAfter(this.validLimiteDate)) {
        // Valide codeEn
        return { info: infosCodes.cfd.Found, value: codeEducNat };
      }

      return { info: infosCodes.cfd.OutDated, value: null };
    } catch (err) {
      logger.error(err);
      return { info: infosCodes.cfd.NotFound, value: null };
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

  findIntituleLong(codeEducNat, lookupBase = "N") {
    this.load();
    const match = find(lookupBase === "N" ? this.bases.N_FORMATION_DIPLOME : this.bases.V_FORMATION_DIPLOME, {
      FORMATION_DIPLOME: codeEducNat,
    });

    if (!match) {
      return { info: infosCodes.intitule.Error, value: null };
    }

    return { info: infosCodes.intitule.NothingDoTo, value: match.LIBELLE_LONG_200 };
  }

  findIntituleCourt(codeEducNat, lookupBase = "N") {
    this.load();
    const match = find(lookupBase === "N" ? this.bases.N_FORMATION_DIPLOME : this.bases.V_FORMATION_DIPLOME, {
      FORMATION_DIPLOME: codeEducNat,
    });

    if (!match) {
      return { info: infosCodes.intitule.Error, value: null };
    }

    return { info: infosCodes.intitule.NothingDoTo, value: match.LIBELLE_STAT_33 };
  }

  findDiplome(codeEducNat) {
    const tronc = codeEducNat.substring(0, 3);
    const match = find(this.bases.N_NIVEAU_FORMATION_DIPLOME, { NIVEAU_FORMATION_DIPLOME: tronc });

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

  findMefsFromCfd(codeEducNat) {
    this.load();
    const match = filter(this.bases.N_MEF, { FORMATION_DIPLOME: codeEducNat });
    if (!match.length) {
      return { info: infosCodes.mef.NotFound, value: [] };
    }
    return { info: infosCodes.mef.NothingDoTo, value: match.map(m => `${m.MEF}`) };
  }

  findMefFromMef11(mef11) {
    this.load();
    const match = find(this.bases.N_MEF, { MEF_STAT_11: mef11 });
    if (!match) {
      return { info: infosCodes.mef.NotFound, value: null };
    }
    return { info: infosCodes.mef.NothingDoTo, value: match.MEF };
  }

  findMefs11(codeEducNat) {
    this.load();

    const tronc = codeEducNat.substring(3, 8);
    const regex = new RegExp(`${tronc}$`, "g");
    const match = filter(this.bases.N_MEF, o => regex.test(o.MEF_STAT_11));

    if (!match.length) {
      return { info: infosCodes.mef.NotFound, value: [] };
    }
    return { info: infosCodes.mef.NothingDoTo, value: match.map(m => `${m.MEF_STAT_11}`) };
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
