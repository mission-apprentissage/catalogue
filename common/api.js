const axios = require("axios");
const { config } = require("../config");

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

  async runFormationUpdater(formationId) {
    try {
      // await API.get("api", `/services?job=formation-update&id=${formation._id}`);
      // setGatherData(3);
      // await API.get("api", `/services?job=rncp&id=${formation._id}`);
      // setGatherData(4);
      // await API.get("api", `/services?job=onisep&id=${formation._id}`);
      // setGatherData(5);
      // formation = await API.get("api", `/formation/${formation._id}`);
      // //console.log(formation);
      // await API.del("api", `/formation/${formation._id}`);
      // setGatherData(6);

      const response = await this.axios.get(`${this.endpoint}/services?job=formation-update&id=${formationId}`);
      return response.data;
    } catch (error) {
      console.error(`MnaCatalogApi Error : ${error}`);
      return null;
    }
  }

  async getEtablissements(options) {
    let { page, allEtablissements, limit, query } = { page: 1, allEtablissements: [], limit: 1050, ...options };

    let params = { page, limit, query };
    console.debug(`Requesting ${this.endpoint}/etablissements with parameters`, params);
    const response = await this.axios.get(`${this.endpoint}/etablissements`, { params });

    const { etablissements, pagination } = response.data;
    allEtablissements = allEtablissements.concat(etablissements); // Should be properly exploded, function should be pure

    if (page < pagination.nombre_de_page) {
      return this.getEtablissements({ page: page + 1, allEtablissements, limit });
    } else {
      return allEtablissements;
    }
  }

  async getEtablissement(idEtablissement) {
    const response = await this.axios.get(`${this.endpoint}/etablissement/${idEtablissement}`);
    return response.data;
  }

  async getFormations(params) {
    try {
      let { page, allFormations, limit, query } = { page: 1, allFormations: [], limit: 10, ...params };

      const response = await this.axios.get(`${this.endpoint}/formations`, { params: { page, limit, query } });
      const { formations, pagination } = response.data;

      allFormations = allFormations.concat(formations); // Should be properly exploded, function should be pure

      if (page < pagination.nombre_de_page) {
        return this.getFormations(page + 1, allFormations);
      } else {
        return allFormations;
      }
    } catch (error) {
      console.error(`MnaCatalogApi Error : ${error}`);
      return [];
    }
  }

  async getFormation(idFormation) {
    try {
      const response = await this.axios.get(`${this.endpoint}/formation/${idFormation}`);
      return response.data;
    } catch (error) {
      console.error(`MnaCatalogApi Error : ${error}`);
      return null;
    }
  }

  // async getEtablissements(page = 1, allEtablissements = []) {
  //   try {
  //     const response = await axios.get(`${this.endpoint}/etablissements`, { params: { page } });
  //     const { etablissements, pagination } = response.data;

  //     allEtablissements = allEtablissements.concat(etablissements); // Should be properly exploded, function should be pure

  //     if (page < pagination.nombre_de_page) {
  //       return this.getEtablissements(page + 1, allEtablissements);
  //     } else {
  //       return allEtablissements;
  //     }
  //   } catch (error) {
  //     if (error.response.status === 504) {
  //       console.log("TIMEOUT");
  //       return [];
  //     } else {
  //       console.log(error);
  //     }
  //     throw new Error("Something went wrong");
  //   }
  // }

  // async getEtablissement(idEtablissement) {
  //   try {
  //     const response = await axios.get(`${this.endpoint}/etablissement/${idEtablissement}`);
  //     return response.data;
  //   } catch (error) {
  //     console.error(error);
  //   }
  // }

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

  // async getFormations(page = 1, allFormations = []) {
  //   try {
  //     const response = await axios.get(`${this.endpoint}/formations`, { params: { page } });
  //     const { formations, pagination } = response.data;

  //     allFormations = allFormations.concat(formations); // Should be properly exploded, function should be pure

  //     if (page < pagination.nombre_de_page) {
  //       return this.getFormations(page + 1, allFormations);
  //     } else {
  //       return allFormations;
  //     }
  //   } catch (error) {
  //     if (error.response.status === 504) {
  //       console.log("TIMEOUT");
  //       return [];
  //     } else {
  //       console.log(error);
  //     }
  //     throw new Error("Something went wrong");
  //   }
  // }

  // async getFormation(idFormation) {
  //   try {
  //     const response = await axios.get(`${this.endpoint}/formation/${idFormation}`);
  //     return response.data;
  //   } catch (error) {
  //     console.error(error);
  //   }
  // }

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
