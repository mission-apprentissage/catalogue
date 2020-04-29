// #region Imports

const {
  infosCodes,
  niveaux,
  mappingNiveauCodeEn,
  PATH_FORMATION_DIPLOME,
  PATH_NIVEAU_FORMATION_DIPLOME,
  PATH_N_MEF,
  PATH_N_DISPOSITIF_FORMATION,
} = require("./Constants");
const { find, filter } = require("lodash");
const moment = require("moment");
const fileManager = require("./FileManager");
const logger = require("../../../../../../common/Logger").mainLogger;

// #endregion

class BcnChecker {
  constructor() {
    this.baseFormationDiplome = fileManager.getDataBcnFormationDiplomeFromFile(PATH_FORMATION_DIPLOME);
    this.baseNiveauFormationDiplome = fileManager.getDataBcnNiveauFormationDiplomeFromFile(
      PATH_NIVEAU_FORMATION_DIPLOME
    );
    this.baseMef = fileManager.getDataBcnMef(PATH_N_MEF);
    this.baseDispositifFormation = fileManager.getDataBcnDispositifFormation(PATH_N_DISPOSITIF_FORMATION);

    this.validLimiteDate = moment("31/08/2020", "DD/MM/YYYY");
  }

  cleanCodeEn(codeEducNat, previousInfo = null) {
    try {
      const match = find(this.baseFormationDiplome, { FORMATION_DIPLOME: codeEducNat });

      if (!match) {
        return { info: infosCodes.codeEnExistBCN.NotFound, value: codeEducNat };
      }

      if (match.DATE_FERMETURE === "") {
        // Valide codeEn
        return { info: previousInfo ? previousInfo : infosCodes.codeEnExistBCN.Found, value: codeEducNat };
      }

      const closingDate = moment(match.DATE_FERMETURE, "DD/MM/YYYY");

      if (closingDate.isAfter(this.validLimiteDate)) {
        // Valide codeEn
        return { info: previousInfo ? previousInfo : infosCodes.codeEnExistBCN.Found, value: codeEducNat };
      }

      if (match.NOUVEAU_DIPLOME_7 !== "") {
        return this.cleanCodeEn(match.NOUVEAU_DIPLOME_7, infosCodes.codeEnExistBCN.Updated);
      }
      if (match.NOUVEAU_DIPLOME_6 !== "") {
        return this.cleanCodeEn(match.NOUVEAU_DIPLOME_6, infosCodes.codeEnExistBCN.Updated);
      }
      if (match.NOUVEAU_DIPLOME_5 !== "") {
        return this.cleanCodeEn(match.NOUVEAU_DIPLOME_5, infosCodes.codeEnExistBCN.Updated);
      }
      if (match.NOUVEAU_DIPLOME_4 !== "") {
        return this.cleanCodeEn(match.NOUVEAU_DIPLOME_4, infosCodes.codeEnExistBCN.Updated);
      }
      if (match.NOUVEAU_DIPLOME_3 !== "") {
        return this.cleanCodeEn(match.NOUVEAU_DIPLOME_3, infosCodes.codeEnExistBCN.Updated);
      }
      if (match.NOUVEAU_DIPLOME_2 !== "") {
        return this.cleanCodeEn(match.NOUVEAU_DIPLOME_2, infosCodes.codeEnExistBCN.Updated);
      }
      if (match.NOUVEAU_DIPLOME_1 !== "") {
        return this.cleanCodeEn(match.NOUVEAU_DIPLOME_1, infosCodes.codeEnExistBCN.Updated);
      }

      return { info: infosCodes.codeEnExistBCN.OutDated, value: codeEducNat };
    } catch (err) {
      logger.error(err);
      return { info: infosCodes.codeEnExistBCN.NotFound, value: codeEducNat };
    }
  }

  cleanNiveau(codeEducNat, niveau) {
    let code = codeEducNat.startsWith("010") ? codeEducNat.substring(0, 4) : codeEducNat.substring(0, 1);
    let foundNiveau = mappingNiveauCodeEn[code];

    if (foundNiveau) {
      const toText = niveaux[parseInt(foundNiveau) - 3];
      if (toText === niveau) {
        //Nothing to do
        return { info: infosCodes.niveau.NothingDoTo, value: niveau };
      }
      if (toText !== niveau) {
        //Must be update
        return { info: infosCodes.niveau.Updated, value: toText };
      }
    } else {
      // other case
      //console.log(codeEducNat, niveau);
      return { info: infosCodes.niveau.Error, value: null };
    }
  }

  cleanIntitule(codeEducNat, intitule) {
    const match = find(this.baseFormationDiplome, { FORMATION_DIPLOME: codeEducNat });

    if (!match) {
      return { info: infosCodes.intitule.Error, value: intitule };
    }

    if (intitule === match.LIBELLE_STAT_33) {
      return { info: infosCodes.intitule.NothingDoTo, value: intitule };
    }

    return { info: infosCodes.intitule.Updated, value: match.LIBELLE_STAT_33 };
  }

  cleanDiplome(codeEducNat, diplome) {
    const tronc = codeEducNat.substring(0, 3);
    const match = find(this.baseNiveauFormationDiplome, { NIVEAU_FORMATION_DIPLOME: tronc });

    if (!match) {
      return { info: infosCodes.diplome.Error, value: diplome };
    }

    if (diplome === match.LIBELLE_100) {
      return { info: infosCodes.intitule.NothingDoTo, value: diplome };
    }

    return { info: infosCodes.intitule.Updated, value: match.LIBELLE_100 };
  }

  getMef10(codeEducNat, mef_10_code) {
    const match = find(this.baseMef, { FORMATION_DIPLOME: `${codeEducNat}`.trim() });

    if (!match) {
      return { info: infosCodes.mef.NotFound, value: "" };
    }

    if (mef_10_code === match.MEF) {
      return { info: infosCodes.mef.NothingDoTo, value: mef_10_code };
    }

    return { info: infosCodes.mef.Updated, value: match.MEF };
  }

  getMefs8(codeEducNat) {
    const tronc = codeEducNat.substring(0, 3);
    const match = filter(this.baseDispositifFormation, { NIVEAU_FORMATION_DIPLOME: tronc });

    if (!match.length) {
      return [];
    }

    return match.map(m => `${m.DISPOSITIF_FORMATION}${codeEducNat.substring(3, codeEducNat.length)}`);
  }

  getModalities(mef_10_code) {
    return {
      duree: mef_10_code !== "" ? mef_10_code.substring(8, 9) : "",
      annee: mef_10_code !== "" ? mef_10_code.substring(9, 10) : "",
    };
  }
}

const bcnChecker = new BcnChecker();
module.exports = bcnChecker;
