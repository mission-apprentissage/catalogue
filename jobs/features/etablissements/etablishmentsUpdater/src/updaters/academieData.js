const logger = require("../../../../../common-jobs/Logger").mainLogger;
const apiEsSup = require("../../../../../common-jobs/EsSupApi");

class AcademieData {
  constructor() {}

  async getUpdates(establishment) {
    let numAcademie = await this.getNumAcademie(establishment);
    let nomAcademie = await this.getNomAcademie(numAcademie);

    if (numAcademie === establishment.num_academie && nomAcademie === establishment.nom_academie) {
      return null;
    }

    return {
      num_academie: numAcademie || -1,
      nom_academie: nomAcademie || null,
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

  async getNomAcademie(numAcademie) {
    if (!numAcademie || numAcademie === -1) {
      logger.error(`No num_academie for formation`);
      return null;
    }

    const nomAcademie = await apiEsSup.getNomAcademieInfoFromNumAcademie(numAcademie);

    if (!nomAcademie) {
      logger.error(`nomAcademie not found for num_academie ${numAcademie}`);
      return null;
    }

    return nomAcademie;
  }
}

const academieData = new AcademieData();
module.exports = academieData;
