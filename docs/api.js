const axios = require("axios");
const { config } = require("../../config");

class Api {
  constructor() {
    this.endpoint = config.aws.apiGateway.endpoint;
    this.token = "XXXX";
  }

  buildHeaders() {
    return {
      headers: {
        Authorization: this.token,
      },
    };
  }

  async getEtablissements(page = 1, allEtablissements = []) {
    try {
      const response = await axios.get(`${this.endpoint}/etablissements`, { params: { page } });
      const { etablissements, pagination } = response.data;

      allEtablissements = allEtablissements.concat(etablissements); // Should be properly exploded, function should be pure

      if (page < pagination.nombre_de_page) {
        return this.getEtablissements(page + 1, allEtablissements);
      } else {
        return allEtablissements;
      }
    } catch (error) {
      if (error.response.status === 504) {
        console.log("TIMEOUT");
        return [];
      } else {
        console.log(error);
      }
      throw new Error("Something went wrong");
    }
  }

  async getEtablissement(idEtablissement) {
    try {
      const response = await axios.get(`${this.endpoint}/etablissement/${idEtablissement}`);
      return response.data;
    } catch (error) {
      console.error(error);
    }
  }

  async createEtablissement(data) {
    try {
      const response = await axios.post(
        `${this.endpoint}/etablissement`,
        { model: data },
        {
          ...this.buildHeaders(),
        }
      );
      return response.data;
    } catch (error) {
      if (error.response.status === 504) {
        return "TIMEOUT";
      } else {
        console.log(error);
      }
      throw new Error("Something went wrong");
    }
  }

  async updateEtablissement(idEtablissement, data) {
    try {
      const response = await axios.put(
        `${this.endpoint}/etablissement/${idEtablissement}`,
        { model: data },
        {
          ...this.buildHeaders(),
        }
      );
      return response.data;
    } catch (error) {
      console.error(error);
    }
  }

  async deleteEtablissement(idEtablissement) {
    try {
      const response = await axios.delete(`${this.endpoint}/etablissement/${idEtablissement}`, {
        ...this.buildHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error(error);
    }
  }

  async getFormations(page = 1, allFormations = []) {
    try {
      const response = await axios.get(`${this.endpoint}/formations`, { params: { page } });
      const { formations, pagination } = response.data;

      allFormations = allFormations.concat(formations); // Should be properly exploded, function should be pure

      if (page < pagination.nombre_de_page) {
        return this.getFormations(page + 1, allFormations);
      } else {
        return allFormations;
      }
    } catch (error) {
      if (error.response.status === 504) {
        console.log("TIMEOUT");
        return [];
      } else {
        console.log(error);
      }
      throw new Error("Something went wrong");
    }
  }

  async getFormation(idFormation) {
    try {
      const response = await axios.get(`${this.endpoint}/formation/${idFormation}`);
      return response.data;
    } catch (error) {
      console.error(error);
    }
  }

  async createFormation(data) {
    try {
      const response = await axios.post(
        `${this.endpoint}/formation`,
        { model: data },
        {
          ...this.buildHeaders(),
        }
      );
      return response.data;
    } catch (error) {
      if (error.response.status === 504) {
        return "TIMEOUT";
      } else {
        console.log(error);
      }
      throw new Error("Something went wrong");
    }
  }

  async updateFormation(idFormation, data) {
    try {
      const response = await axios.put(
        `${this.endpoint}/formation/${idFormation}`,
        { model: data },
        {
          ...this.buildHeaders(),
        }
      );
      return response.data;
    } catch (error) {
      //throw new Error(error);
      console.error(error);
    }
  }

  async deleteFormation(idFormation) {
    try {
      const response = await axios.delete(`${this.endpoint}/formation/${idFormation}`, {
        ...this.buildHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error(error);
    }
  }
}

const api = new Api();
module.exports = api;
