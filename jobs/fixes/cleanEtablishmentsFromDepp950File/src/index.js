// #region Imports

const filePathConstants = require("./constants/FilePathConstants");
const { connectToMongo } = require("../../../../common/mongo");
const { Establishment } = require("../../../common/models");

const logger = require("./services/Logger");
const fileManager = require("./services/FileManager");
const Exporter = require("./services/Exporter");
const asyncForEach = require("../../../common/utils").asyncForEach;
const writeXlsxFile = require("./services/FileUtils").writeXlsxFile;
const path = require("path");
const fs = require("fs");
const exporter = new Exporter();

// #endregion

const run = async () => {
  try {
    logger.mainLogger.info(" -- Début du cleaning Depp950 -- ");
    await connectToMongo();

    await verificationEtablissementsInDepp950();
    await integrateRetoursMatchingMultiples();

    logger.mainLogger.info(" -- Fin du cleaning Depp950 -- ");
  } catch (err) {
    logger.mainLogger.error(err);
  }
};

/**
 * Verification des établissements dans le fichier Depp950
 */
const verificationEtablissementsInDepp950 = async () => {
  logger.mainLogger.info(" -- Début de la vérification fichier DEPP950 des établissements -- ");

  // Get reference data

  const etablissementMissingUai = await Establishment.find({
    uai: null,
  });

  const deppData = await fileManager.getCatalogDEPPDataFromFile(filePathConstants.PATH_LISTDEPP_FILE);

  // Init Stats
  let nbMatchingUnique = 0;
  let nbMatchingMultiple = 0;
  let nbNoMatching = 0;

  // Iterate in etablissements without uai
  await asyncForEach(etablissementMissingUai, async etablissementItem => {
    const { code_insee_localite } = etablissementItem;
    const etablissementsFoundInDepp = deppData.filter(item =>
      item.commune.trim() === code_insee_localite ? code_insee_localite.trim() : ""
    );

    if (etablissementsFoundInDepp.length === 1) {
      // Case matching unique - update etablissement ES from DEPP Data
      logger.mainLogger.info(`Matching 1-1 for ${etablissementItem._id}`);
      nbMatchingUnique++;
      await Establishment.findOneAndUpdate(
        { _id: etablissementItem._id },
        {
          uai: etablissementsFoundInDepp[0].numero_uai,
        },
        { new: true }
      );
    } else if (etablissementsFoundInDepp.length > 1) {
      // Case matching multiple - generate XLSX files for Anne & Christophe
      logger.mainLogger.info(`Matching 1-X for ${etablissementItem._id}`);
      nbMatchingMultiple++;
      await exportMultipleMatchingsToExcel(etablissementItem, etablissementsFoundInDepp);
    } else {
      // No Matching
      logger.noMatchingLogger.info(`No Matching for ${etablissementItem._id}`);
      nbNoMatching++;
    }
  });

  logger.mainLogger.info(` ${nbMatchingUnique} Matching Uniques traités dans Fichier DEPP950 `);
  logger.mainLogger.info(` ${nbMatchingMultiple} Matching Multiples à gérer dans Fichier DEPP950 `);
  logger.mainLogger.info(` ${nbNoMatching} Sans Matching dans Fichier DEPP950 `);
  logger.mainLogger.info(" -- Fin de la vérification fichier DEPP950 des établissements -- ");
};

/**
 * Export multiple matching data to XLSX File
 * @param {*} etablissementItem
 * @param {*} etablissementFoundInDepp
 */
const exportMultipleMatchingsToExcel = async (etablissementItem, etablissementFoundInDepp) => {
  // Get info for etablissement in ES
  const etablissementItemInfoForChecking = {
    __mna_id: etablissementItem._id,
    _mna_siret: etablissementItem.siret,
    _mna_code_insee_localite: etablissementItem.code_insee_localite,
    _mna_raison_sociale: etablissementItem.raison_sociale,
  };

  // Build etablissementsMultipleMatching array
  const etablissementsMultipleMatching = new Array();
  await asyncForEach(etablissementFoundInDepp, async foundInDepp => {
    logger.multipleMatchingsLogger.info(`Matching 1-X for ${etablissementItem._id} - ${foundInDepp.numero_uai}`);
    const etablissementToCheck = { ...etablissementItemInfoForChecking, ...foundInDepp };
    etablissementsMultipleMatching.push(etablissementToCheck);
  });

  // Export to XLSX file
  const worksheets = [exporter.toWorksheet(etablissementsMultipleMatching, "Catalogue")];
  await writeXlsxFile(worksheets, "../../_output", `MissingDepp950_${etablissementItem._id}.xlsx`);
};

/**
 * Integrate data from returned matching multiples files
 */
const integrateRetoursMatchingMultiples = async () => {
  try {
    logger.returnMatchingsMultiplesLogger.info(" -- Début de l'intégration des matching multiples -- ");
    const inputPath = path.join(__dirname, "../_inputFiles/retoursMatchingMultiples");

    // Read input folder
    fs.readdir(inputPath, (err, files) => {
      if (err) return console.log("Unable to scan directory: " + err);

      // Iterate in files OK
      const filesToCheck = files.filter(item => item.startsWith("OK_", 0));
      filesToCheck.forEach(file => {
        // Get File Data
        const filepath = path.join(__dirname, `../_inputFiles/retoursMatchingMultiples/${file}`);
        const fileData = fileManager.getReturnDEPPDataFromFile(filepath);

        // Check if data found
        if (fileData) {
          // PROBLEME readdir n'est pas async
          // await asyncForEach(fileData, async dataRow => {
          //   // Update UAI for matching found
          //   await Establishment.findOneAndUpdate(
          //     { _id: dataRow.__mna_id },
          //     {
          //       uai: dataRow.numero_uai,
          //     }, { new: true }
          //   );
          // });
        } else {
          logger.returnMatchingsMultiplesLogger.error(`No data for file ${file}`);
        }
      });
    });

    logger.returnMatchingsMultiplesLogger.info(" -- Fin de l'intégration des matching multiples -- ");
  } catch (err) {
    logger.returnMatchingsMultiplesLogger.error(err);
  }
};

run();
