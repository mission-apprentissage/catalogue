// #region Imports

const filePathConstants = require("./constants/FilePathConstants");
const fileManager = require("./FileManager");
const some = require("lodash").some;
const { infosCodes } = require("./constants/EtablissementsConstants");
const logger = require("../../../../../../common/Logger").mainLogger;

// #endregion

/**
 * Vérifications methods for Etablissements
 */
class EtablissementChecker {
  constructor() {}

  getInfoDepp(establishment) {
    try {
      if (!establishment.uai) {
        return infosCodes.infoDEPP.MissingUai;
      } else {
        const jsonData = fileManager.getCatalogDEPPDataFromFile(filePathConstants.PATH_LISTDEPP_FILE);
        // Search if matching uai with Depp file
        if (some(jsonData, item => `${item.numero_uai}`.trim() === `${establishment.uai}`.trim())) {
          return infosCodes.infoDEPP.Found;
        } else {
          return infosCodes.infoDEPP.NotFound;
        }
      }
    } catch (err) {
      logger.error(err);
      return infosCodes.infoDEPP.NotFound;
    }
  }

  getInfoDGEFP(establishment) {
    try {
      const jsonData = fileManager.getCatalogDGEFPDataFromFile(filePathConstants.PATH_LISTDGEFP_FILE);
      // Check on Siren
      if (some(jsonData, item => `${item.siren}`.trim() === `${establishment.siren}`.trim())) {
        return infosCodes.infoDGEFP.SirenMatch;
      } else {
        // Check on Siret
        if (some(jsonData, item => `${item.siren}${item.numEtablissment.trim()}` === `${establishment.siret}`.trim())) {
          return infosCodes.infoDGEFP.SiretMatch;
        } else {
          // Check on Siret_Siege_Social
          if (
            some(
              jsonData,
              item => `${item.siren}${item.numEtablissment.trim()}` === `${establishment.siret_siege_social}`.trim()
            )
          ) {
            return infosCodes.infoDGEFP.SiretSiegeSocialMatch;
          }
        }
      }
      return infosCodes.infoDGEFP.NotFound;
    } catch (err) {
      logger.error(err);
      return infosCodes.infoDGEFP.NotFound;
    }
  }

  getInfoDataDock(establishment) {
    try {
      const jsonData = fileManager.getDataDockDataFromFile(filePathConstants.PATH_BASE_DATADOCK);
      const result = jsonData.find(item => {
        return (
          `${item.siren}`.trim() === `${establishment.siren}`.trim() ||
          `${item.siret.trim()}` === `${establishment.siret}`.trim() ||
          `${item.siret_siege_social.trim()}` === `${establishment.siret_siege_social}`.trim()
        );
      });
      if (!result) return infosCodes.infoDATADOCK.NotFound;
      if (result.REFERENCABLE.trim() === "OUI") return infosCodes.infoDATADOCK.Referencable;
      if (result.REFERENCABLE.trim() === "NON") return infosCodes.infoDATADOCK.NotReferencable;
      if (result.REFERENCABLE.trim() === "") return infosCodes.infoDATADOCK.NotFound;

      return infosCodes.infoDATADOCK.NotFound;
    } catch (err) {
      logger.error(err);
      return infosCodes.infoDATADOCK.NotFound;
    }
  }

  getInfoDataGouv(establishment) {
    try {
      const jsonData = fileManager.getDataGouvOfsDataFromFile(filePathConstants.PATH_DATAGOUV_OFS_FILE);
      jsonData.forEach(data => {
        // Slice because of CSV Import adding double double quotes
        // Quick fix for num_etablissement - not optimised - not sure if useful
        const num_etablissementFixed = this.convertStringToNumEtablissement(data.num_etablissement.slice(1, -1));
        const parsedSiret = `${data.siren.slice(1, -1)}${num_etablissementFixed}`;
        if (`${parsedSiret}`.trim() === `${establishment.siret}`.trim() && data.cfa === "Oui") {
          return infosCodes.infoDATAGOUV.Found;
        }
      });

      return infosCodes.infoDATAGOUV.NotFound;
    } catch (err) {
      logger.error(err);
      return infosCodes.infoDATAGOUV.NotFound;
    }
  }

  convertStringToNumEtablissement(input) {
    switch (input.length) {
      case 1:
        return `0000${input}`;
      case 2:
        return `000${input}`;
      case 3:
        return `00${input}`;
      case 4:
        return `0${input}`;
      case 5:
        return `${input}`;

      default:
        return `${input}`;
    }
  }
}

const etablissementChecker = new EtablissementChecker();
module.exports = etablissementChecker;
