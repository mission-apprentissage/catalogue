// #region Imports

const { infosCodes, PATH_FORMATION_APPRENTISSAGE_AFFELNET } = require("./Constants");
const { filter } = require("lodash");
const fileManager = require("./FileManager");

// #endregion

class AffelnetChecker {
  constructor() {
    this.baseFormation = fileManager.getDataAffelnetFromFile(PATH_FORMATION_APPRENTISSAGE_AFFELNET);
    this.baseFormation = filter(this.baseFormation, f => f.CODE_FORMATION_ACCUEIL_BAN.trim() !== "AFFECTATION");
  }

  findFormation(mef_10_code, mef_8_code, uais, code_commune_insee, code_postal) {
    // if (mef_10_code !== "") {
    //   if (mef_8_code !== "") {
    //     return this.findFormationMef8(mef_8_code, uais, code_commune_insee, code_postal);
    //   } else {
    //     return { info: infosCodes.affelnet.Error, value: null };
    //   }
    // }
    const foundByMef10 = affelnetChecker.filterFormationByMef10(mef_10_code, uais);

    if (foundByMef10.length === 0) {
      if (mef_8_code !== "") {
        return this.findFormationMef8(mef_8_code, uais, code_commune_insee, code_postal);
      } else {
        return { info: infosCodes.affelnet.NotFound, value: null };
      }
    } else if (foundByMef10.length > 1) {
      return this.findFormationByLocation(foundByMef10, code_commune_insee, code_postal);
    } else {
      return { info: infosCodes.affelnet.Found, value: foundByMef10[0] };
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
      const tronc = codeFormationAccueil !== "AFFECTATION" ? codeFormationAccueil.substring(0, 10) : null;
      return tronc === mef_10_code && uaiFound;
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
