// #region Imports

const { infosCodes, PATH_FORMATION_APPRENTISSAGE_AFFELNET } = require("./Constants");
const { filter } = require("lodash");
const fileManager = require("./FileManager");

// #endregion

class AffelnetChecker {
  constructor() {
    this.baseFormation = fileManager.getDataAffelnetFromFile(PATH_FORMATION_APPRENTISSAGE_AFFELNET);
    //this.baseFormation = filter(this.baseFormation, f => f.CODE_FORMATION_ACCUEIL_BAN.trim() !== "AFFECTATION");
  }

  findFormation(mef_10_code, mef_8_code, uais, code_commune_insee, code_postal, intitule_court, nom_academie) {
    // if (mef_10_code !== "") {
    //   if (mef_8_code !== "") {
    //     return this.findFormationMef8(mef_8_code, uais, code_commune_insee, code_postal);
    //   } else {
    //     return { info: infosCodes.affelnet.Error, value: null };
    //   }
    // }
    //const foundByMef10 = affelnetChecker.filterFormationByMef10(mef_10_code, uais);
    const foundByMef10 = affelnetChecker.filterFormationByIntituleCourt(intitule_court, uais);

    if (foundByMef10.length === 0) {
      // if (mef_8_code !== "") {
      //   return this.findFormationMef8(mef_8_code, uais, code_commune_insee, code_postal);
      // } else {
      return { info: infosCodes.affelnet.NotFound, value: null };
      //}
    } else if (foundByMef10.length > 1) {
      //return this.findFormationByLocation(foundByMef10, code_commune_insee, code_postal);
      return { info: infosCodes.affelnet.NotFound, value: null };
    } else {
      const formationAffelnet = foundByMef10[0];
      const tmpNomAca = nom_academie
        ? nom_academie
            .toUpperCase()
            .replace("Ç", "C")
            .replace("É", "E")
        : "";
      if (tmpNomAca === formationAffelnet.ACADEMIE.trim()) {
        const cci = formationAffelnet.CODE_COMMUNE_INSEE.trim();
        const cp = formationAffelnet.CODE_POSTAL.trim();
        if (cci === code_commune_insee && cp === code_postal) {
          // PERFECT MATCH
          return { info: infosCodes.affelnet.FoundPerfect, value: formationAffelnet };
        } else if (cci === code_commune_insee || cp === code_postal) {
          // SUPER MATCH
          return { info: infosCodes.affelnet.FoundSuper, value: null };
        } else {
          // MATCH
          return { info: infosCodes.affelnet.Found, value: null };
        }
      } else {
        return { info: infosCodes.affelnet.NotFound, value: null };
      }
    }
  }

  findFormationMef8(mef_8_code, uais, code_commune_insee, code_postal) {
    const foundByMef8 = affelnetChecker.filterFormationByMef8(mef_8_code, uais);
    if (foundByMef8.length === 0) {
      return { info: infosCodes.affelnet.NotFound, value: null };
    } else if (foundByMef8.length > 1) {
      return this.findFormationByLocation(foundByMef8, code_commune_insee, code_postal);
    } else {
      return { info: infosCodes.affelnet.Found, value: foundByMef8[0] };
    }
  }

  findFormationByLocation(formations, code_commune_insee, code_postal) {
    const matchLocation = filter(formations, affelnetFormation => {
      const cci = affelnetFormation.CODE_COMMUNE_INSEE.trim();
      const cp = affelnetFormation.CODE_POSTAL.trim();
      return cci === code_commune_insee || cp === code_postal;
    });
    if (matchLocation.length === 1) {
      return { info: infosCodes.affelnet.Found, value: matchLocation[0] };
    } else {
      return { info: infosCodes.affelnet.FoundMultiple, value: matchLocation };
    }
  }

  filterFormationByMef10(mef_10_code, uais) {
    return filter(this.baseFormation, affelnetFormation => {
      const codeFormationAccueil = affelnetFormation.CODE_FORMATION_ACCUEIL_BAN.trim();
      const uaiFormation = affelnetFormation.UAI.trim();
      const uaiFound = uais.includes(uaiFormation);
      const tronc = codeFormationAccueil.substring(0, 10);
      if (tronc === mef_10_code)
        console.log(`--------------------------------------${mef_10_code}-----------------------------------------`);
      return tronc === mef_10_code && uaiFound;
    });
  }

  filterFormationByIntituleCourt(intitule_court, uais) {
    return filter(this.baseFormation, affelnetFormation => {
      const libelleFormationAccueil = affelnetFormation.LIBELLE_FORMATION_ACCUEIL_BAN.trim();
      const uaiFormation = affelnetFormation.UAI.trim();
      const uaiFound = uais.includes(uaiFormation);
      return libelleFormationAccueil.includes(intitule_court) && uaiFound;
    });
  }

  filterFormationByMef8(mef_8_code, uais) {
    return filter(this.baseFormation, affelnetFormation => {
      const codeFormationAccueil = affelnetFormation.CODE_FORMATION_ACCUEIL_BAN.trim();
      const uaiFormation = affelnetFormation.UAI.trim();
      const uaiFound = uais.includes(uaiFormation);
      const tronc8 = codeFormationAccueil !== "AFFECTATION" ? codeFormationAccueil.substring(0, 8) : null;
      return tronc8 === mef_8_code && uaiFound;
    });
  }
}

const affelnetChecker = new AffelnetChecker();
module.exports = affelnetChecker;
