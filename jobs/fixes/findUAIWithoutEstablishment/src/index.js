// #region Imports
const { connectToMongo, closeMongoConnection } = require("../../../common/mongo");
const logger = require("../../common-jobs/Logger").mainLogger;
const asyncForEach = require("../../common-jobs/utils").asyncForEach;
const uniq = require("lodash").uniq;
const fs = require("fs-extra");

const { Formation, Establishment } = require("../../common-jobs/models");

const run = async () => {
  try {
    logger.info(" -- Start find -- ");
    await connectToMongo();

    //const establishments = await Establishment.find({ uai: { $eq: null } });

    //console.log(establishments);
    const formations = await Formation.find({});
    const uaisNotFound = [];
    const uaisFormation = uniq(formations.map(f => f._doc.uai_formation));
    await asyncForEach(uaisFormation, async uaiFormation => {
      if (uaiFormation !== null) {
        const establishment = await Establishment.find({ uai: uaiFormation.trim() });
        if (!establishment.length) {
          uaisNotFound.push({ uai: uaiFormation, siret: "" });
        }
      }
    });
    await fs.writeJson("./uais.json", uaisNotFound);

    closeMongoConnection();
    logger.info(" -- End find -- ");
  } catch (err) {
    logger.error(err);
  }
};

run();
