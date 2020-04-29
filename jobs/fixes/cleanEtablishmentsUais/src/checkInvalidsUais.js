// #region Imports

const { connectToMongo } = require("../../../common/mongo");
const { Establishment, Formation } = require("../../../common/models");
const asyncForEach = require("../../../common/utils").asyncForEach;
const logger = require("./services/Logger");
const fileManager = require("./services/FileManager");
const writeXlsxFile = require("./services/FileUtils").writeXlsxFile;
const { getEtablissementFormattedMnaData, getTrainingFormattedMnaData } = require("./common/catalogFormatData");

const Exporter = require("./services/Exporter");
const exporter = new Exporter();

// #endregion

// Arrays - Maps
const uaisCfaFoundUaisSiteNotFoundList = new Array();
const uaisCfaNotFoundUaisSiteNotFoundList = new Array();
const uaisCfaNotFoundUaisSiteFoundList = new Array();

/**
 * Run
 */
const run = async () => {
  try {
    logger.mainLogger.info(` -- Start Cleaning Etablishments UAIs with DEPP -- [STAGE=${process.env.STAGE}]`);

    await connectToMongo();
    await checkUaisInvalidInCatalog();

    await exportUaisCfaFoundUaiSiteNotFoundListToExcel();
    await exportUaisCfaNotFoundUaisSiteFoundListToExcel();
    await exportUaisCfaNotFoundUaisSiteNotFoundListToExcel();

    logger.mainLogger.info(" -- End Cleaning Etablishments UAIs with DEPP -- ");
  } catch (err) {
    logger.mainLogger.error(err);
  }
};

/**
 * Check invalid uais method
 */
const checkUaisInvalidInCatalog = async () => {
  logger.mainLogger.info(" -- Recherche des cas ou UAI CFA trouvés mais pas les UAIs Site -- ");

  const allEtablissmentsWithUai = await Establishment.find().and([{ uai: { $ne: null } }, { uai: { $ne: "" } }]);
  const allFormations = await Formation.find({});
  const deppData = await fileManager.getDEPPData();

  await asyncForEach(deppData, async deppRow => {
    // Etablissements in depp matching catalog uai on numero_uai_cfa
    const etablissementsFoundInCatalog = allEtablissmentsWithUai.filter(
      item => item.uai.trim() === deppRow.numero_uai_cfa.trim()
    );

    // uaisSite in Depp for this uaiCfa
    const uaisSiteInDepp = deppData
      .filter(item => item.numero_uai_cfa.trim() === deppRow.numero_uai_cfa.trim())
      .map(item => item.numero_uai_site.trim());

    // uaiCfa found in catalog
    if (etablissementsFoundInCatalog.length !== 0) {
      await asyncForEach(uaisSiteInDepp, async uaiSiteInDepp => {
        const formationForUaiSite = await Formation.find({ uai_formation: `${uaiSiteInDepp}` });

        if (formationForUaiSite.length === 0) {
          // uaiCfa Found & uaiSite NotFound in catalog
          uaisCfaFoundUaisSiteNotFoundList.push(getEtablissementFormattedMnaData(etablissementsFoundInCatalog));
          logger.mainLogger.info(
            `uaiCfa ${deppRow.numero_uai_cfa} Found & uaiSite ${uaiSiteInDepp} NotFound in catalog`
          );
        }
      });
    } else {
      // uaiCfa not found in catalog
      await asyncForEach(uaisSiteInDepp, async uaiSiteInDepp => {
        const formationForUaiSite = allFormations.filter(item => item.uai_formation === `${uaiSiteInDepp}`);

        if (formationForUaiSite.length !== 0) {
          // uaiCfa not found & uaiSite found in catalog
          uaisCfaNotFoundUaisSiteFoundList.push(getTrainingFormattedMnaData(formationForUaiSite));
          logger.mainLogger.info(
            `uaiCfa ${deppRow.numero_uai_cfa} not found & uaiSite ${uaiSiteInDepp} found in catalog`
          );
        } else {
          uaisCfaNotFoundUaisSiteNotFoundList.push(deppRow); // uaiCfa not found & uaiSite not found in catalog
          logger.mainLogger.info(
            `uaiCfa ${deppRow.numero_uai_cfa} not found & uaiSite ${uaiSiteInDepp} not found in catalog`
          );
        }
      });
    }
  });

  logger.mainLogger.info(" -- Fin Recherche des cas ou UAI CFA trouvés mais pas les UAIs Site -- ");
};

/**
 * Export exportUaisCfaFound ToExcel
 */
const exportUaisCfaFoundUaiSiteNotFoundListToExcel = async () => {
  if (uaisCfaFoundUaisSiteNotFoundList.length > 0) {
    const worksheets = [exporter.toWorksheet(uaisCfaFoundUaisSiteNotFoundList, "A Analyser")];
    await writeXlsxFile(worksheets, "../../_output", `uaiCfaDansCatalogueUaiSiteHorsCatalogue.xlsx`);
  }
};

/**
 * Export exportuaisCfaNotFoundUaisSiteFoundList ToExcel
 */
const exportUaisCfaNotFoundUaisSiteFoundListToExcel = async () => {
  if (uaisCfaFoundUaisSiteNotFoundList.length > 0) {
    const worksheets = [exporter.toWorksheet(uaisCfaNotFoundUaisSiteFoundList, "A Analyser")];
    await writeXlsxFile(worksheets, "../../_output", `uaiCfaHorsCatalogueUaiSiteDansCatalogue.xlsx`);
  }
};

/**
 * Export exportUaisCfaNotFoundUaisSiteNotFoundList ToExcel
 */
const exportUaisCfaNotFoundUaisSiteNotFoundListToExcel = async () => {
  if (uaisCfaFoundUaisSiteNotFoundList.length > 0) {
    const worksheets = [exporter.toWorksheet(uaisCfaNotFoundUaisSiteNotFoundList, "A Analyser")];
    await writeXlsxFile(worksheets, "../../_output", `uaiCfaHorsCatalogueUaiSiteHorsCatalogue.xlsx`);
  }
};

run();
