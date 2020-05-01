// #region Imports

const { connectToMongo } = require("../../../../common/mongo");
const { Establishment } = require("../../../common/models");
const asyncForEach = require("../../../common/utils").asyncForEach;
const logger = require("./services/Logger");
const fileManager = require("./services/FileManager");
const writeXlsxFile = require("./services/FileUtils").writeXlsxFile;
const { getEtablissementFormattedMnaData } = require("./common/catalogFormatData");
const Exporter = require("./services/Exporter");
const exporter = new Exporter();

// #endregion

// Init Stats
let nbMatchingEtablissementsUnique = 0;
let nbMatchingEtablissementsMultiple = 0;

// Arrays - Maps
const noUaisEtablissementsData = new Array();

/**
 * Run
 */
const run = async () => {
  try {
    logger.mainLogger.info(` -- Start Cleaning Etablishments UAIs with DEPP -- [STAGE=${process.env.STAGE}]`);

    await connectToMongo();
    await checkUaiBaseEtablissementCfa();

    logger.mainLogger.info(" -- End Cleaning Etablishments UAIs with DEPP -- ");
  } catch (err) {
    logger.mainLogger.error(err);
  }
};

/**
 * Je veux m’assurer que le code UAI partie établissement existe et correspond à un “numéro UAI CFA”.
 */
const checkUaiBaseEtablissementCfa = async () => {
  logger.mainLogger.info(" -- Début Vérification Uai Base Etablissement-Cfa -- ");

  const allEtablissmentsWithUai = await Establishment.find().and([{ uai: { $ne: null } }, { uai: { $ne: "" } }]);
  const deppData = await fileManager.getDEPPData();

  // Iterate in etablissements
  await asyncForEach(allEtablissmentsWithUai, async etablissement => {
    const etablissementsFoundInDepp = deppData.filter(item => item.numero_uai_cfa.trim() === etablissement.uai.trim());

    if (etablissementsFoundInDepp.length === 1) {
      // Case matching unique
      logger.mainLogger.info(`Matching 1-1 for Etablissement ${etablissement.id}`);
      nbMatchingEtablissementsUnique++;
    } else if (etablissementsFoundInDepp.length > 1) {
      // Case matching multiple - generate XLSX files for analysis
      logger.multipleMatchingsLogger.info(`Matching 1-X for Etablissement ${etablissement.id}`);
      nbMatchingEtablissementsMultiple++;
      await exportMultipleMatchingsEtablissementsToExcel(etablissement, etablissementsFoundInDepp);
    } else {
      // No Matching - generate XLSX files for analysis
      logger.noMatchingLogger.info(`No Matching for Etablissement ${etablissement.id}`);
      noUaisEtablissementsData.push(getEtablissementFormattedMnaData(etablissement));
    }
  });

  await exportNoUaisEtablissementsToExcel();

  logger.mainLogger.info(
    ` ${nbMatchingEtablissementsUnique} Matching etablissements uniques traités dans Fichier Dispo DEPP `
  );
  logger.mainLogger.info(
    ` ${nbMatchingEtablissementsMultiple} Matching etablissements multiples à gérer dans Fichier Dispo DEPP `
  );
  logger.mainLogger.info(` ${noUaisEtablissementsData.length} etablissements sans Matching dans Fichier Dispo DEPP `);
  logger.mainLogger.info(" -- Fin de la vérification  des établissements -- ");
};

/**
 * Export multiple matching data to XLSX File
 * @param {*} etablissement
 * @param {*} etablissementsFoundInFile
 */
const exportMultipleMatchingsEtablissementsToExcel = async (etablissement, etablissementsFoundInFile) => {
  // Build etablissementsMultipleMatching array
  const etablissementsMultipleMatching = new Array();
  await asyncForEach(etablissementsFoundInFile, async foundInDepp => {
    logger.multipleMatchingsLogger.info(`Matching 1-X for ${etablissement.id} - ${foundInDepp.numero_uai_cfa}`);
    const etablissementToCheck = {
      ...getEtablissementFormattedMnaData(etablissement),
      ...foundInDepp,
    };
    etablissementsMultipleMatching.push(etablissementToCheck);
  });

  // Export to XLSX file
  if (etablissementsMultipleMatching.length > 0) {
    const worksheets = [exporter.toWorksheet(etablissementsMultipleMatching, "Catalogue")];
    await writeXlsxFile(worksheets, "../../_output", `MultiplesUaisInListeCFA_sitesformation_${etablissement.id}.xlsx`);
  }
};

/**
 * Export etablissements sans uais in DeppFile
 */
const exportNoUaisEtablissementsToExcel = async () => {
  const worksheets = [exporter.toWorksheet(noUaisEtablissementsData, "Catalogue")];
  await writeXlsxFile(worksheets, "../../_output", `EtablissementsSansUaisInListeCFA_sitesformation.xlsx`);
};

run();
