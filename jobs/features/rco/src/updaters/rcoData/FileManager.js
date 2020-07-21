// #region Imports
const csvToJson = require("convert-csv-to-json");
const XLSX = require("xlsx");
const { PATH_RCO_EXPORT, PATH_RCO_EXPORT_OLD } = require("./Constants");
const logger = require("../../../../../common-jobs/Logger").mainLogger;

// #endregion

class FileManager {
  constructor() {
    logger.info("FileManager - Init Reference Files");

    this.dataRCOFormation = this.getDataRcoFromFile(PATH_RCO_EXPORT, "new");
    this.dataRCOFormationOld = this.getDataRcoFromFile(PATH_RCO_EXPORT_OLD, "old");

    logger.info("FileManager - End Init Reference Files");
  }

  /**
   * Get Data RCO formation from File
   * @param {string} rcoFormationPath
   */
  getDataRcoFromFile(rcoFormationPath, fileType) {
    try {
      if (this.dataRCOFormation && fileType === "new") {
        return this.dataRCOFormation;
      } else if (this.dataRCOFormationOld && fileType === "old") {
        return this.dataRCOFormationOld;
      } else {
        const { sheet_name_list, workbook } = this.readXLSXFile(rcoFormationPath);
        const worksheet = workbook.Sheets[sheet_name_list[0]];

        const jsonSheetArray = XLSX.utils.sheet_to_json(worksheet, {
          header: [
            "codeRegion", // -
            "intituleRegion", // -
            "numeroFO", // -
            "numeroAf", // -
            "nom", // nom
            "codeCERTIFINFO", // -
            "diplome", // diplome
            "intitule", // intitule_long
            "codeEducNat", // educ_nat_code
            "codeNiveauEN", // Old niveau
            "nomNiveauEN", // -
            "niveau", // niveau
            "nomNiveau", // -
            "nomCFA_OFA_Responsable", // etablissement_responsable_enseigne
            "raisonSocialeCFA_OFA", // entreprise_raison_sociale
            "siret_CFA_OFA", // etablissement_responsable_siret
            "siret_formateur", //etablissement siret - etablissement_formateur_siret
            "raisonSocialeFormateur", //  etablissement siret -  entreprise_raison_sociale
            "modaliteEntreesSorties", // -
            "periode", // periode
            "uai", // uai_formation
            "email", // email
            "codePostal", // code_postal
            "codeCommuneInsee", // code_commune_insee
            "capacite", // capacite
            "identifiantSession", // -
            "codeRNCP", // rncp_code
            "nbHeuresTotalAF", // -
            "cas", // -
            "casLibelle", // -
          ],
          range: 1,
        });

        return jsonSheetArray;
      }
    } catch (err) {
      logger.error(`FileManager getDataRcoFromFile ${err}`);
      return null;
    }
  }

  readJsonFromCsvFile(localPath) {
    const jsonArray = csvToJson.getJsonFromCsv(localPath);
    return jsonArray;
  }

  readXLSXFile(localPath) {
    const workbook = XLSX.readFile(localPath, { codepage: 65001 });

    return { sheet_name_list: workbook.SheetNames, workbook };
  }
}

const fileManager = new FileManager();
module.exports = fileManager;
