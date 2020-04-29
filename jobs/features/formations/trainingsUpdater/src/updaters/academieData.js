const logger = require("../../../../../common/Logger").mainLogger;
const apiEsSup = require("../../../../../common/EsSupApi");

class AcademieData {
  constructor() {}

  async getUpdates(training) {
    let nomAcademie = await this.cleanEmptyNomAcademies(training);
    const nomAcademieSiege = await this.cleanEmtpyNomAcademiesSiege(training);

    if (nomAcademie === training.nom_academie && nomAcademieSiege === training.nom_academie_siege) {
      // Nothing to do
      return null;
    }

    let numAcademie = training.num_academie;
    if (!nomAcademie) {
      const { nom_academie, num_academie } = await this.cleanEmptyNomAndNumAcademies(training);
      nomAcademie = nom_academie;
      numAcademie = num_academie;
    }

    return {
      nom_academie: nomAcademie || null,
      nom_academie_siege: nomAcademieSiege || null,
      num_academie: numAcademie || -1,
    };
  }

  async cleanEmptyNomAcademies(training) {
    if (training.nom_academie !== null) {
      return training.nom_academie;
    }

    if (!training.num_academie || training.num_academie === -1) {
      logger.error(`No num_academie for formation ${training._id}`);
      return null;
    }

    const nomAcademie = await apiEsSup.getNomAcademieInfoFromNumAcademie(training.num_academie);

    if (!nomAcademie) {
      logger.error(`nomAcademie not found for num_academie ${training.num_academie} for formation ${training._id}`);
      return null;
    }

    return nomAcademie;
  }

  async cleanEmtpyNomAcademiesSiege(training) {
    if (training.nom_academie_siege !== null) {
      return training.nom_academie_siege;
    }

    if (!training.num_academie_siege || training.num_academie_siege === -1) {
      logger.error(`No num_academie_siege for formation ${training._id}`);
      return null;
    }

    const nomAcademieSiege = await apiEsSup.getNomAcademieInfoFromNumAcademie(training.num_academie_siege);

    if (!nomAcademieSiege) {
      logger.error(
        `nomAcademieSiege not found for num_academie_siege ${training.num_academie_siege} for formation ${training._id}`
      );
      return null;
    }

    return nomAcademieSiege;
  }

  async cleanEmptyNomAndNumAcademies(training) {
    if (training.nom_academie !== null && training.num_academie !== -1) {
      return {
        nom_academie: training.nom_academie,
        num_academie: training.num_academie,
      };
    }

    if (training.num_departement.length !== 2) {
      logger.error(`Error num_departement for formation ${training._id}`);
      return {
        nom_academie: null,
        num_academie: null,
      };
    }

    const nomAcademie = await apiEsSup.getNomAcademieInfoFromNumDepartement(training.num_departement);

    if (!nomAcademie) {
      logger.error(
        `nomAcademie not found for num_departement ${training.num_departement} for formation ${training._id}`
      );
      return {
        nom_academie: null,
        num_academie: null,
      };
    }

    const numAcademie = await apiEsSup.getNumAcademieInfoFromNumDepartement(training.num_departement);

    if (!numAcademie) {
      logger.error(
        `numAcademie not found for num_departement ${training.num_departement} for formation ${training._id}`
      );
      return {
        nom_academie: nomAcademie,
        num_academie: null,
      };
    }

    return {
      nom_academie: nomAcademie,
      num_academie: numAcademie,
    };
  }
}

const academieData = new AcademieData();
module.exports = academieData;
