// #region Imports
const filePathConstants = require("./constants/FilePathConstants");
const { connectToMongo } = require("../../../common/mongo");
const { Establishment } = require("../../../common/models");
//const { prepareRequest, handleRequest, signedRequest, getEtablissements } = require("../../../common/elasticSearch");
//const ENV = "dev";
//const { endpoint, region } = config[ENV].aws.elasticsearch;
const logger = require("./services/Logger");
const fileManager = require("./services/FileManager");
const Exporter = require("./services/Exporter");
const asyncForEach = require("../../../common/utils").asyncForEach;
const writeXlsxFile = require("./services/FileUtils").writeXlsxFile;
const exporter = new Exporter();

// Init Stats
let nbMatchingUnique = 0;
let nbMatchingMultiple = 0;
let nbNoMatching = 0;
let nbUaisMissingInDger = 0;

// No Uai Array
const noUaisDataDger = new Array();

// #endregion

const run = async () => {
  try {
    await connectToMongo();
    await verificationEtablissementsInDger();
    await exportNoUaisToExcel();
  } catch (err) {
    logger.mainLogger.error(err);
  }
};

/**
 * Verification des établissements dans le fichier DGER - Agri
 */
const verificationEtablissementsInDger = async () => {
  logger.mainLogger.info(" -- Début de la vérification fichier DGER Agri des établissements -- ");

  const etablissementMissingUai = await Establishment.find({
    uai: null,
  });
  const dgerData = await fileManager.getDgerDataFromFile(filePathConstants.PATH_DGER_FILE);

  // Iterate in etablissements found in dger - match codeInsee
  await asyncForEach(etablissementMissingUai, async etablissementItem => {
    const { code_insee_localite } = etablissementItem;
    const etablissementsFoundInDger = dgerData.filter(item =>
      item.commune.trim() === code_insee_localite ? code_insee_localite.trim() : ""
    );

    if (etablissementsFoundInDger.length === 1) {
      // Case matching unique - update etablissement ES from DEPP Data
      logger.mainLogger.info(`Matching 1-1 for ${etablissementItem._id}`);
      nbMatchingUnique++;
      await Establishment.findOneAndUpdate(
        { _id: etablissementItem._id },
        {
          uai: etablissementsFoundInDger.numero_uai,
        },
        { new: true }
      );
    } else if (etablissementsFoundInDger.length > 1) {
      // Case matching multiple - generate XLSX files
      logger.mainLogger.info(`Matching 1-X for ${etablissementItem._id}`);
      nbMatchingMultiple++;
      await exportMultipleMatchingsToExcel(etablissementItem, etablissementsFoundInDger);
    } else {
      // No Matching
      logger.noMatchingLogger.info(`No Matching for ${etablissementItem._id}`);
      nbNoMatching++;
    }
  });

  logger.mainLogger.info(` ${nbUaisMissingInDger} lignes dans Fichier DGER Sans Uai `);
  logger.mainLogger.info(` ${nbMatchingUnique} Matching Uniques dans Fichier DGER Agri `);
  logger.mainLogger.info(` ${nbMatchingMultiple} Matching Multiples dans Fichier DGER Agri `);
  logger.mainLogger.info(` ${nbNoMatching} Sans Matching dans Fichier DGER Agri `);
  logger.mainLogger.info(" -- Fin de la vérification fichier DGER Agri des établissements -- ");
};

/**
 * Export multiple matching data to XLSX File
 * @param {*} etablissementItem
 * @param {*} etablissementFoundInDGER
 */
const exportMultipleMatchingsToExcel = async (etablissementItem, etablissementFoundInDGER) => {
  // Get info for etablissement in ES
  const etablissementItemInfoForChecking = {
    __mna_id: etablissementItem._id,
    _mna_siret: etablissementItem.siret,
    _mna_code_insee_localite: etablissementItem.code_insee_localite,
    _mna_raison_sociale: etablissementItem.raison_sociale,
  };

  // Build etablissementsMultipleMatching array
  const etablissementsMultipleMatching = new Array();
  await asyncForEach(etablissementFoundInDGER, async foundInDepp => {
    if (!foundInDepp.numero_uai) {
      logger.mainLogger.error(
        `Numero_uai missing in dgerFile for commune ${foundInDepp.commune} - denomination ${etablissementFoundInDGER.denomination_principale}`
      );
      nbUaisMissingInDger++;
      noUaisDataDger.push(foundInDepp);
    } else {
      logger.multipleMatchingsLogger.info(`Matching 1-X for ${etablissementItem._id} - ${foundInDepp.numero_uai}`);
      const etablissementToCheck = { ...etablissementItemInfoForChecking, ...foundInDepp };
      etablissementsMultipleMatching.push(etablissementToCheck);
    }
  });

  // Export to XLSX file
  if (etablissementsMultipleMatching.length > 0) {
    const worksheets = [exporter.toWorksheet(etablissementsMultipleMatching, "Catalogue")];
    await writeXlsxFile(worksheets, "../../_output", `MissingDGER_${etablissementItem._id}.xlsx`);
  }
};

/**
 * Export etablissements sans uais
 */
const exportNoUaisToExcel = async () => {
  const worksheets = [exporter.toWorksheet(noUaisDataDger, "Catalogue")];
  await writeXlsxFile(worksheets, "../../_output", `EtablissementsSansUaisInDGER.xlsx`);
};

run();
