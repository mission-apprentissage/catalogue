const axios = require("axios");
const endpoint = "https://data.enseignementsup-recherche.gouv.fr/api/records/1.0/search/";
const titleCase = require("title-case").titleCase;

class EsSupApi {
  constructor() {}

  /**
   * Get the numAcademie from nomAcademie
   * @param {*} nomAcademie
   */
  async getNumAcademieInfoFromNomAcademie(nomAcademie) {
    try {
      const nomAcademieFormatted = titleCase(nomAcademie.toLowerCase());
      const response = await axios.get(
        `${endpoint}?dataset=fr-esr-referentiel-geographique&refine.aca_nom=${nomAcademieFormatted}&rows=1`
      );

      if (response.data) {
        if (response.data.records.length > 0) {
          if (response.data.records[0].fields) {
            return response.data.records[0].fields.aca_code;
          }
        }
      }

      console.error(`No data found for ${nomAcademie}`);
      return null;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  /**
   * Get the nomAcademie from numAcademie
   * @param {*} numAcademie
   */
  async getNomAcademieInfoFromNumAcademie(numAcademie) {
    try {
      // Transform to string with 2 digits - some cases are String some are int - this code handle both
      numAcademie = Number.parseInt(numAcademie).toLocaleString("fr-FR", { minimumIntegerDigits: 2 });
      const response = await axios.get(
        `${endpoint}?dataset=fr-esr-referentiel-geographique&refine.aca_code=${numAcademie}&rows=1`
      );

      if (response.data) {
        if (response.data.records.length > 0) {
          if (response.data.records[0].fields) {
            return response.data.records[0].fields.aca_nom;
          }
        }
      }

      console.error(`No data found for ${numAcademie}`);
      return null;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  /**
   * Get the nomAcademie from numDepartement
   * @param {*} numDepartement
   */
  async getNomAcademieInfoFromNumDepartement(numDepartement) {
    try {
      const response = await this.getInfoFromNumDepartement(numDepartement);

      if (response) {
        if (response.aca_nom) {
          return response.aca_nom;
        }
      }

      console.error(`No data found for ${numDepartement}`);
      return null;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  /**
   * Get the numAcademie from numDepartement
   * @param {*} numDepartement
   */
  async getNumAcademieInfoFromNumDepartement(numDepartement) {
    try {
      const response = await this.getInfoFromNumDepartement(numDepartement);

      if (response) {
        if (response.aca_code) {
          return Number.parseInt(response.aca_code);
        }
      }

      console.error(`No data found for ${numDepartement}`);
      return null;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  /**
   * Get the numAcademie from codeCommune
   * @param {*} nomAcademie
   */
  async getNumAcademieInfoFromCodeCommune(codeCommune) {
    try {
      const response = await this.getInfoFromCodeCommune(codeCommune);

      if (response) {
        if (response.aca_code) {
          return Number.parseInt(response.aca_code);
        }
      }

      console.error(`No data found for ${codeCommune}`);
      return null;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  // #region Get Infos Methods

  /**
   * Get data from Code commune  insee
   * @param {*} codeCommune
   */
  async getInfoFromCodeCommune(codeCommune) {
    try {
      const response = await axios.get(
        `${endpoint}?dataset=fr-esr-referentiel-geographique&refine.com_code=${codeCommune}&rows=1`
      );

      if (response.data && response.data.records.length > 0) {
        return response.data.records[0].fields;
      }

      console.error(`No data found for ${codeCommune}`);
      return null;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  /**
   * Get data from NumDepartement
   * @param {*} codeCommune
   */
  async getInfoFromNumDepartement(numDepartement) {
    try {
      const response = await axios.get(
        `${endpoint}?dataset=fr-esr-referentiel-geographique&refine.dep_code=${numDepartement}&rows=1`
      );

      if (response.data && response.data.records.length > 0) {
        return response.data.records[0].fields;
      }

      console.error(`No data found for ${numDepartement}`);
      return null;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  // #endregion
}

const esSupApi = new EsSupApi();
module.exports = esSupApi;
