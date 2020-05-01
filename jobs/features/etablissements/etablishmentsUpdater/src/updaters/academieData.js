const logger = require("../../../../../common-jobs/Logger").mainLogger;
const apiEsSup = require("../../../../../common-jobs/EsSupApi");

class AcademieData {
  constructor() {}

  async getUpdates(establishment) {
    let numAcademie = await this.getNumAcademie(establishment);

    if (numAcademie === establishment.num_academie) {
      return null;
    }

    return {
      num_academie: numAcademie || -1,
    };
  }

  async getNumAcademie(establishment) {
    // Search numAcademie as int from codeInsee
    const numAcademie = await apiEsSup.getNumAcademieInfoFromCodeCommune(establishment.code_insee_localite);

    if (!numAcademie) {
      logger.error(
        `numAcademie not found for code_insee_localite ${establishment.code_insee_localite} for establishment ${establishment._id}`
      );
      return null;
    }

    return numAcademie;
  }
}

const academieData = new AcademieData();
module.exports = academieData;
