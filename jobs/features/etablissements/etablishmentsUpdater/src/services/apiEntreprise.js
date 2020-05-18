const logger = require("../../../../../common-jobs/Logger").mainLogger;
const axios = require("axios");

// Cf Documentation : https://doc.entreprise.api.gouv.fr/#param-tres-obligatoires
const apiEndpoint = "https://entreprise.api.gouv.fr/v2";
const apiParams = {
  token:
    "eyJhbGciOiJIUzI1NiJ9.eyJ1aWQiOiJiZmZmYzRjNy0wNjI2LTQwYTQtYjhkYy01NThkNTFlZGRjNGMiLCJqdGkiOiI2NDQ4YjJlYy03MGE0LTRjMzYtYjY4ZC1kOGU3ZjdjYmMwODkiLCJyb2xlcyI6WyJldGFibGlzc2VtZW50cyIsImVudHJlcHJpc2VzIl0sInN1YiI6IkNvbnN0cnVjdGlvbiBkJ3VuIGNhdGFsb2d1ZSBkZXMgZm9ybWF0aW9ucyBlbiBhcHByZW50aXNzYWdlIiwiaWF0IjoxNTg1NzQzODI5LCJ2ZXJzaW9uIjoiMS4wIiwiZXhwIjoxNjMzMDkxMDI5fQ.5SVLdpo66bVH5mJD_FTk7PJBW8cxEU_OLkS-RoOK3-I",
  context: "Catalogue MNA",
  recipient: "12000101100010", // Siret Dinum
  object: "Consolidation des données du Catalogue MNA",
};

class ApiEntreprise {
  constructor() {}

  async getEntrepriseInfoFromSiren(siren) {
    try {
      const response = await axios.get(`${apiEndpoint}/entreprises/${siren}`, { params: apiParams });
      return response.data;
    } catch (error) {
      logger.error(error);
      return null;
    }
  }

  async getEntrepriseInfoFromSiret(siret) {
    try {
      const response = await axios.get(`${apiEndpoint}/etablissements/${siret}`, { params: apiParams });
      return response.data;
    } catch (error) {
      logger.error(error);
      return null;
    }
  }
}

const apiEntreprise = new ApiEntreprise();
module.exports = apiEntreprise;
