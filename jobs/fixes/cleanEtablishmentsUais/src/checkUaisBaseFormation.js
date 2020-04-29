// #region Imports

const { connectToMongo } = require("../../../common/mongo");
const { Formation } = require("../../../common/models");
const asyncForEach = require("../../../common/utils").asyncForEach;
const logger = require("./services/Logger");
const fileManager = require("./services/FileManager");
const { getTrainingFormattedMnaData } = require("./common/catalogFormatData");
const writeXlsxFile = require("./services/FileUtils").writeXlsxFile;
const Exporter = require("./services/Exporter");
const exporter = new Exporter();

// #endregion

// Init Stats
let nbMatchingFormationsUnique = 0;
let nbMatchingFormationsMultiple = 0;

// Arrays - Maps
const noUaisFormationsData = new Array();

/**
 * Run
 */
const run = async () => {
  try {
    logger.mainLogger.info(` -- Start Cleaning Etablishments UAIs with DEPP -- [STAGE=${process.env.STAGE}]`);

    await connectToMongo();
    await checkUaiBaseFormations();

    logger.mainLogger.info(" -- End Cleaning Etablishments UAIs with DEPP -- ");
  } catch (err) {
    logger.mainLogger.error(err);
  }
};

/**
 * Je veux m’assurer que le code UAI partie formation existe et correspond à un “numéro UAI site”
 */
const checkUaiBaseFormations = async () => {
  logger.mainLogger.info(" -- Début Vérification Uai Base Formations -- ");

  const allFormationsWithUai = await Formation.find().and([
    { uai_formation: { $ne: null } },
    { uai_formation: { $ne: "" } },
  ]);
  const deppData = await fileManager.getDEPPData();

  // Iterate in etablissements
  await asyncForEach(allFormationsWithUai, async formation => {
    const formationsFoundInDepp = deppData.filter(
      item => item.numero_uai_site.trim() === formation.uai_formation.trim()
    );

    if (formationsFoundInDepp.length === 1) {
      // Case matching unique
      logger.mainLogger.info(`Matching 1-1 for Training ${formation.id}`);
      nbMatchingFormationsUnique++;
    } else if (formationsFoundInDepp.length > 1) {
      // Case matching multiple - generate XLSX files for analysis
      logger.multipleMatchingsLogger.info(`Matching 1-X for Training ${formation.id}`);
      nbMatchingFormationsMultiple++;
      await exportMultipleMatchingsTrainingsToExcel(formation, formationsFoundInDepp);
    } else {
      // No Matching - generate XLSX files for analysis
      logger.noMatchingLogger.info(`No Matching for Training ${formation.id}`);
      noUaisFormationsData.push(getTrainingFormattedMnaData(formation));
    }
  });

  await exportNoUaisTrainingsToExcel();

  logger.mainLogger.info(` ${nbMatchingFormationsUnique} Matching formations uniques traités dans Fichier Dispo DEPP `);
  logger.mainLogger.info(
    ` ${nbMatchingFormationsMultiple} Matching formations multiples à gérer dans Fichier Dispo DEPP `
  );
  logger.mainLogger.info(` ${noUaisFormationsData.length} formations sans matching dans Fichier Dispo DEPP `);
  logger.mainLogger.info(" -- Fin de la vérification  des uais formations -- ");
};

/**
 * Export des matchings multiples - formations
 * @param {*} formation
 * @param {*} formationsFoundInFile
 */
const exportMultipleMatchingsTrainingsToExcel = async (formation, formationsFoundInFile) => {
  // Build array
  const multipleMatchings = new Array();
  await asyncForEach(formationsFoundInFile, async foundInDepp => {
    logger.multipleMatchingsLogger.info(`Matching 1-X for Training ${formation.id} - ${foundInDepp.numero_uai_site}`);
    const etablissementToCheck = {
      ...getTrainingFormattedMnaData(formation),
      ...foundInDepp,
    };
    multipleMatchings.push(etablissementToCheck);
  });

  // Export to XLSX file
  if (multipleMatchings.length > 0) {
    const worksheets = [exporter.toWorksheet(multipleMatchings, "Catalogue")];
    await writeXlsxFile(worksheets, "../../_output", `MultiplesUaisInListeCFA_sitesformation_${formation.id}.xlsx`);
  }
};

/**
 * Export formations sans uais in DeppFile
 */
const exportNoUaisTrainingsToExcel = async () => {
  const worksheets = [exporter.toWorksheet(noUaisFormationsData, "Catalogue")];
  await writeXlsxFile(worksheets, "../../_output", `FormationsSansUaisInListeCFA_sitesformation.xlsx`);
};

run();
