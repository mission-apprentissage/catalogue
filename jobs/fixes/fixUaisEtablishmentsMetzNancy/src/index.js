// #region Imports
const { connectToMongo } = require("../../../../common/mongo");
const logger = require("../../../common-jobs/Logger").mainLogger;
const asyncForEach = require("../../../common-jobs/utils").asyncForEach;
const { Establishment } = require("../../../common-jobs/models");
const etablissementsToUpdate = require("./data/etablissementsToUpdate.json");
//#endregion

const run = async () => {
  try {
    logger.info(" -- Start Fix Etablissements Metz-Nancy -- ");
    await connectToMongo();

    await asyncForEach(etablissementsToUpdate, async toUpdate => {
      const currentEtablissement = await Establishment.findOne({ siret: `${toUpdate.siret}` });
      if (currentEtablissement) {
        currentEtablissement.uai = toUpdate.uai;
        currentEtablissement.save();
        logger.info(`- etablissement { siret: ${toUpdate.siret} successfully updated with  uai: ${toUpdate.uai}`);
      }
    });

    logger.info(" -- End Fix Etablissements Metz-Nancy -- ");
    return;
  } catch (err) {
    logger.error(err);
  }
};

run();
