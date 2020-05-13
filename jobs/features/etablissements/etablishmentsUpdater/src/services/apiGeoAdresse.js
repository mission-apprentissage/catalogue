const logger = require("../../../../../common-jobs/Logger").mainLogger;
const axios = require("axios");

// Cf Documentation : https://geo.api.gouv.fr/adresse
const apiEndpoint = "https://api-adresse.data.gouv.fr";

class ApiGeoAdresse {
  constructor() {}

  async search(q, postcode = null) {
    try {
      const response = await axios.get(`${apiEndpoint}/search/?q=${q}${postcode ? `&postcode=${postcode}` : ""}`);
      return response.data;
    } catch (error) {
      logger.error(error);
      return null;
    }
  }
}

const apiGeoAdresse = new ApiGeoAdresse();
module.exports = apiGeoAdresse;
