// #region Imports
const csvToJson = require("convert-csv-to-json");
const path = require("path");
const logger = require("../../../../../common-jobs/Logger").mainLogger;

// #endregion

const PATH_N_FORMATION_DIPLOME = path.join(__dirname, "../../assets/bcnTables/n_formation_diplome.csv");
const PATH_NIVEAU_FORMATION_DIPLOME = path.join(__dirname, "../../assets/bcnTables/n_niveau_formation_diplome.csv");
const PATH_SPECIALITE = path.join(__dirname, "../../assets/bcnTables/n_lettre_specialite.csv");
const PATH_N_MEF = path.join(__dirname, "../../assets/bcnTables/n_mef.csv");
const PATH_N_DISPOSITIF_FORMATION = path.join(__dirname, "../../assets/bcnTables/n_dispositif_formation.csv");

class FileManager {
  constructor() {}

  loadBases() {
    logger.info("FileManager - Init Reference Files");

    const result = {
      N_FORMATION_DIPLOME: null,
      N_LETTRE_SPECIALITE: null,
      N_NIVEAU_FORMATION_DIPLOME: null,
      N_MEF: null,
      N_DISPOSITIF_FORMATION: null,
    };

    try {
      result.N_FORMATION_DIPLOME = this.readJsonFromCsvFile(PATH_N_FORMATION_DIPLOME);
    } catch (err) {
      logger.error(`FileManager Error ${PATH_N_FORMATION_DIPLOME}`);
    }

    try {
      result.N_LETTRE_SPECIALITE = this.readJsonFromCsvFile(PATH_SPECIALITE);
    } catch (err) {
      logger.error(`FileManager Error ${PATH_SPECIALITE}`);
    }

    try {
      result.N_NIVEAU_FORMATION_DIPLOME = this.readJsonFromCsvFile(PATH_NIVEAU_FORMATION_DIPLOME);
    } catch (err) {
      logger.error(`FileManager Error ${PATH_NIVEAU_FORMATION_DIPLOME}`);
    }

    try {
      result.N_MEF = this.readJsonFromCsvFile(PATH_N_MEF);
    } catch (err) {
      logger.error(`FileManager Error ${PATH_N_MEF}`);
    }

    try {
      result.PATH_N_DISPOSITIF_FORMATION = this.readJsonFromCsvFile(PATH_N_DISPOSITIF_FORMATION);
    } catch (err) {
      logger.error(`FileManager Error ${PATH_N_DISPOSITIF_FORMATION}`);
    }

    logger.info("FileManager - End Init Reference Files");
    return result;
  }

  readJsonFromCsvFile(localPath) {
    const jsonArray = csvToJson.getJsonFromCsv(localPath);
    return jsonArray;
  }
}

const fileManager = new FileManager();
module.exports = fileManager;
