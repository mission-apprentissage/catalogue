// #region Imports
const csvToJson = require("convert-csv-to-json");
const XLSX = require("xlsx");
const { PATH_RCO_EXPORT } = require("./Constants");
const logger = require("../../../../../common-jobs/Logger").mainLogger;

// #endregion

class FileManager {
  constructor() {
    logger.info("FileManager - Init Reference Files");

    this.dataRCOFormation = this.getDataRcoFromFile(PATH_RCO_EXPORT);

    logger.info("FileManager - End Init Reference Files");
  }

  /**
   * Get Data RCO formation from File
   * @param {string} rcoFormationPath
   */
  getDataRcoFromFile(rcoFormationPath) {
    try {
      if (this.dataRCOFormation) {
        return this.dataRCOFormation;
      } else {
        const { sheet_name_list, workbook } = this.readXLSXFile(rcoFormationPath);
        const worksheet = workbook.Sheets[sheet_name_list[0]];

        const jsonSheetArray = XLSX.utils.sheet_to_json(worksheet, {
          header: [
            "codeRegion",
            "intituleRegion",
            "numeroFO",
            "numeroAf",
            "nom",
            "codeCERTIFINFO",
            "diplome",
            "intitule",
            "codeEducNat",
            "codeNiveauEN",
            "nomNiveauEN",
            "niveau",
            "nomNiveau",
            "nomCFA_OFA_Responsable",
            "raisonSocialeCFA_OFA",
            "siret_CFA_OFA",
            "siret_formateur",
            "raisonSocialeFormateur",
            "modaliteEntreesSorties",
            "periode",
            "Uai",
            "email",
            "codePostal",
            "codeCommuneInsee",
            "capacite",
            "identifiantSession",
            "codeRNCP",
            "nbHeuresTotalAF",
            "cas",
            "casLibelle",
          ],
          range: 2,
        });

        return jsonSheetArray;
      }
    } catch (err) {
      logger.error(`FileManager getDataRcoFromFile Error ${err}`);
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
