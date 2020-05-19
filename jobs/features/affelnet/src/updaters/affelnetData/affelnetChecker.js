// #region Imports

const { infosCodes, PATH_FORMATION_APPRENTISSAGE_AFFELNET } = require("./Constants");
const { filter, find } = require("lodash");
const fileManager = require("./FileManager");

// #endregion

class AffelnetChecker {
  constructor() {
    this.baseFormation = fileManager.getDataPSupFromFile(PATH_FORMATION_APPRENTISSAGE_AFFELNET);
    this.baseFormation = filter(this.baseFormation, f => f.CODEMEF !== "");
  }

  findFormation(mef_10_code, mef_8_code, uais, code_commune_insee, code_postal) {
    if (mef_10_code !== "") {
      if (mef_8_code !== "") {
        return this.findFormationMef8(mef_8_code, uais, code_commune_insee, code_postal);
      } else {
        return { info: infosCodes.psup.Error, value: null };
      }
    }
    const foundByMef10 = affelnetChecker.filterFormationByMef10(mef_10_code, uais);

    if (foundByMef10.length === 0) {
      if (mef_8_code !== "") {
        return this.findFormationMef8(mef_8_code, uais, code_commune_insee, code_postal);
      } else {
        return { info: infosCodes.psup.NotFound, value: null };
      }
    } else if (foundByMef10.length > 1) {
      return this.findFormationByLocation(foundByMef10, code_commune_insee, code_postal);
    } else {
      return { info: infosCodes.psup.Found, value: foundByMef10[0] };
    }
  }

  findFormationMef8(mef_8_code, uais, code_commune_insee, code_postal) {
    const foundByMef8 = affelnetChecker.filterFormationByMef8(mef_8_code, uais);
    if (foundByMef8.length === 0) {
      return { info: infosCodes.psup.NotFound, value: null };
    } else if (foundByMef8.length > 1) {
      return this.findFormationByLocation(foundByMef8, code_commune_insee, code_postal);
    } else {
      return { info: infosCodes.psup.Found, value: foundByMef8[0] };
    }
  }

  findFormationByLocation(formations, code_commune_insee, code_postal) {
    const matchLocation = filter(formations, psupFormation => {
      return psupFormation.CODECOMMUNE === code_commune_insee || psupFormation.CODEPOSTAL === code_postal;
    });
    if (matchLocation.length === 1) {
      return { info: infosCodes.psup.Found, value: matchLocation[0] };
    } else {
      return { info: infosCodes.psup.FoundMultiple, value: matchLocation };
    }
  }

  filterFormationByMef10(mef_10_code, uais) {
    return filter(this.baseFormation, psupFormation => {
      const uaiGesFound = uais.includes(psupFormation.UAI_GES);
      const uaiComposanteFound = uais.includes(psupFormation.UAI_COMPOSANTE);
      const uaiAffFound = uais.includes(psupFormation.UAI_AFF);
      return psupFormation.CODEMEF === mef_10_code && (uaiGesFound || uaiComposanteFound || uaiAffFound);
    });
  }

  filterFormationByMef8(mef_8_code, uais) {
    return filter(this.baseFormation, psupFormation => {
      const uaiGesFound = uais.includes(psupFormation.UAI_GES);
      const uaiComposanteFound = uais.includes(psupFormation.UAI_COMPOSANTE);
      const uaiAffFound = uais.includes(psupFormation.UAI_AFF);
      const tronc8 = psupFormation.CODEMEF.substring(0, 8);
      return tronc8 === mef_8_code && (uaiGesFound || uaiComposanteFound || uaiAffFound);
    });
  }

  findFormationsUais(uais) {
    const result = filter(this.baseFormation, psupFormation => {
      const uaiGesFound = uais.includes(psupFormation.UAI_GES);
      const uaiComposanteFound = uais.includes(psupFormation.UAI_COMPOSANTE);
      const uaiAffFound = uais.includes(psupFormation.UAI_AFF);
      return uaiGesFound || uaiComposanteFound || uaiAffFound;
    });
    if (result.length === 0) {
      return { info: infosCodes.psup.NotFound, value: null };
    }
    return { info: infosCodes.psup.Found, value: result };
  }

  isUaiExist(uai) {
    const result = find(this.baseFormation, psupFormation => {
      const uaiGesFound = uai === psupFormation.UAI_GES;
      const uaiComposanteFound = uai === psupFormation.UAI_COMPOSANTE;
      const uaiAffFound = uai === psupFormation.UAI_AFF;
      return uaiGesFound || uaiComposanteFound || uaiAffFound;
    });
    if (!result) {
      return false;
    }
    return true;
  }
}

const affelnetChecker = new AffelnetChecker();
module.exports = affelnetChecker;
