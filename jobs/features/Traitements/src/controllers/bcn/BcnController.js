// #region Imports

const {
  infosCodes,
  niveaux,
  mappingNiveauCodeEn,
  PATH_FORMATION_DIPLOME,
  PATH_NIVEAU_FORMATION_DIPLOME,
  PATH_N_MEF,
  PATH_N_DISPOSITIF_FORMATION,
  PATH_SPECIALITE,
} = require("./Constants");
const { find, filter } = require("lodash");
const moment = require("moment");
const fileManager = require("./FileManager");
const logger = require("../../../../../common-jobs/Logger").mainLogger;

// #endregion

class BcnController {
  constructor() {
    this.baseFormationDiplome = fileManager.getDataBcnFormationDiplomeFromFile(PATH_FORMATION_DIPLOME);
    this.baseNiveauFormationDiplome = fileManager.getDataBcnNiveauFormationDiplomeFromFile(
      PATH_NIVEAU_FORMATION_DIPLOME
    );
    this.baseMef = fileManager.getDataBcnMef(PATH_N_MEF);
    this.baseDispositifFormation = fileManager.getDataBcnDispositifFormation(PATH_N_DISPOSITIF_FORMATION);
    this.baseSpecialite = fileManager.getDataSpecialiteFromFile(PATH_SPECIALITE);

    this.validLimiteDate = moment("31/08/2020", "DD/MM/YYYY");
  }

  findCfd(codeEducNat, previousInfo = null) {
    try {
      const match = find(this.baseFormationDiplome, { FORMATION_DIPLOME: codeEducNat });

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
    const match = find(this.baseFormationDiplome, { FORMATION_DIPLOME: codeEducNat });

    if (!match) {
      return { info: infosCodes.intitule.Error, value: null };
    }

    return { info: infosCodes.intitule.NothingDoTo, value: match.LIBELLE_LONG_200 };
  }

  findIntituleCourt(codeEducNat) {
    const match = find(this.baseFormationDiplome, { FORMATION_DIPLOME: codeEducNat });

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

  findMefs10(codeEducNat) {
    const match = filter(this.baseMef, { FORMATION_DIPLOME: codeEducNat });
    if (!match.length) {
      return { info: infosCodes.mef.NotFound, value: [] };
    }
    return { info: infosCodes.mef.NothingDoTo, value: match.map(m => `${m.MEF}`) };
  }

  findMefs8(codeEducNat) {
    const match = filter(this.baseMef, { FORMATION_DIPLOME: codeEducNat });

    if (!match.length) {
      return { info: infosCodes.mef.NotFound, value: [] };
    }
    return {
      info: infosCodes.mef.NothingDoTo,
      value: match.map(m => `${m.DISPOSITIF_FORMATION}${codeEducNat.substring(3, codeEducNat.length)}`),
    };
  }

  getModalities(mef_10_code) {
    return {
      duree: mef_10_code !== "" ? mef_10_code.substring(8, 9) : "",
      annee: mef_10_code !== "" ? mef_10_code.substring(9, 10) : "",
    };
  }

  getSpeciality(specialityLetter) {
    try {
      const specialityData = this.baseSpecialite.find(item => item.LETTRE_SPECIALITE.trim() === specialityLetter);
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
