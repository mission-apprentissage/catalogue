// #region Imports
const { connectToMongo } = require("../../../../../common/mongo");
const logger = require("../../../../common-jobs/Logger").mainLogger;
const fileManager = require("./services/FileManager");
const { Establishment } = require("../../../../common-jobs/models");
const asyncForEach = require("../../../../common-jobs/utils").asyncForEach;
const Exporter = require("./services/Exporter");
const writeXlsxFile = require("./services/FileUtils").writeXlsxFile;
const exporter = new Exporter();

const run = async () => {
  try {
    logger.info(" -- Start Calcul Coverage YPareo -- ");
    await connectToMongo();

    let nbEtablissementInYpareo = 0;
    let cfaInYpareo = [];
    let cfaNotInYpareo = [];

    const ypareoData = fileManager.ypareoData;
    const establishments = await Establishment.find({});

    await asyncForEach(ypareoData, async ypareoCfa => {
      if (establishments.find(item => item.siret === `${ypareoCfa.SIRET}`)) {
        nbEtablissementInYpareo++;
        cfaInYpareo.push({
          siret: `${ypareoCfa.SIRET}`,
        });
      } else {
        cfaNotInYpareo.push({
          siret: `${ypareoCfa.SIRET}`,
        });
      }
    });

    // Export to XLSX file
    if (cfaInYpareo.length > 0) {
      const worksheets = [exporter.toWorksheet(cfaInYpareo, "cfaInYpareo")];
      await writeXlsxFile(worksheets, "../../_output", `CFAInYPareo.xlsx`);
    }

    // Export to XLSX file
    if (cfaNotInYpareo.length > 0) {
      const worksheets = [exporter.toWorksheet(cfaNotInYpareo, "cfaNotInYpareo")];
      await writeXlsxFile(worksheets, "../../_output", `CfaNotInYpareo.xlsx`);
    }

    logger.info(`Nb d'etablissements du catalogue dans fichier YPareo ${nbEtablissementInYpareo}`);
    logger.info(" -- End Calcul Coverage YPareo -- ");
  } catch (err) {
    logger.error(err);
  }
};

run();
