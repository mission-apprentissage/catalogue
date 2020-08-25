// #region Imports
const csvToJson = require("convert-csv-to-json");
const {
  PATH_FORMATION_DIPLOME,
  PATH_NIVEAU_FORMATION_DIPLOME,
  PATH_SPECIALITE,
  PATH_N_MEF,
  PATH_N_DISPOSITIF_FORMATION,
} = require("./Constants");
const logger = require("../../../../../common-jobs/Logger").mainLogger;

// #endregion

class FileManager {
  constructor() {
    logger.info("FileManager - Init Reference Files");

    this.dataBcnSpecialite = this.getDataSpecialiteFromFile(PATH_SPECIALITE);
    this.dataBcnFormationDiplome = this.getDataBcnFormationDiplomeFromFile(PATH_FORMATION_DIPLOME);
    this.dataBcnNiveauFormationDiplome = this.getDataBcnNiveauFormationDiplomeFromFile(PATH_NIVEAU_FORMATION_DIPLOME);
    this.dataBcnMef = this.getDataBcnMef(PATH_N_MEF);
    this.dataDispositifFormation = this.getDataBcnDispositifFormation(PATH_N_DISPOSITIF_FORMATION);

    logger.info("FileManager - End Init Reference Files");
  }

  /**
   * Get Data BCN specialite from File
   * @param {string} bcnSpecialitePath
   */
  getDataSpecialiteFromFile(bcnSpecialitePath) {
    try {
      if (this.dataBcnSpecialite) {
        return this.dataBcnSpecialite;
      } else {
        return this.readJsonFromCsvFile(bcnSpecialitePath);
      }
    } catch (err) {
      logger.error(`FileManager getDataSpecialiteFromFile Error ${err}`);
      return null;
    }
  }

  /**
   * Get Data BCN formation diplôme from File
   * @param {string} bcnFormationDiplomePath
   */
  getDataBcnFormationDiplomeFromFile(bcnFormationDiplomePath) {
    try {
      if (this.dataBcnFormationDiplome) {
        return this.dataBcnFormationDiplome;
      } else {
        return this.readJsonFromCsvFile(bcnFormationDiplomePath);
      }
    } catch (err) {
      logger.error(`FileManager getDataBcnFormationDiplomeFromFile Error ${err}`);
      return null;
    }
  }
  /**
   * Get Data BCN niveau formation diplôme from File
   * @param {string} bcnNiveauFormationDiplomePath
   */
  getDataBcnNiveauFormationDiplomeFromFile(bcnNiveauFormationDiplomePath) {
    try {
      if (this.dataBcnNiveauFormationDiplome) {
        return this.dataBcnNiveauFormationDiplome;
      } else {
        return this.readJsonFromCsvFile(bcnNiveauFormationDiplomePath);
      }
    } catch (err) {
      logger.error(`FileManager getDataBcnNiveauFormationDiplomeFromFile Error ${err}`);
      return null;
    }
  }
  /**
   * Get Data BCN MEF from File
   * @param {string} bcnMefPath
   */
  getDataBcnMef(bcnMefPath) {
    try {
      if (this.dataBcnMef) {
        return this.dataBcnMef;
      } else {
        return this.readJsonFromCsvFile(bcnMefPath);
      }
    } catch (err) {
      logger.error(`FileManager getDataBcnMef Error ${err}`);
      return null;
    }
  }
  /**
   * Get Data BCN N DISPOSITIF FORMATION from File
   * @param {string} bcnDispositifFormationPath
   */
  getDataBcnDispositifFormation(bcnDispositifFormationPath) {
    try {
      if (this.dataDispositifFormation) {
        return this.dataDispositifFormation;
      } else {
        return this.readJsonFromCsvFile(bcnDispositifFormationPath);
      }
    } catch (err) {
      logger.error(`FileManager getDataBcnDispositifFormation Error ${err}`);
      return null;
    }
  }

  readJsonFromCsvFile(localPath) {
    const jsonArray = csvToJson.getJsonFromCsv(localPath);
    return jsonArray;
  }
}

const fileManager = new FileManager();
module.exports = fileManager;
