// #region Imports
const { connectToMongo } = require("../../../common/mongo");
const logger = require("../../../common/Logger").mainLogger;
const asyncForEach = require("../../../common/utils").asyncForEach;

const { Establishment } = require("../../../common/models");

const run = async () => {
  try {
    logger.info(" -- Start Fix Missing Siren(s) -- ");
    await connectToMongo();

    // Get all etablishments without siren
    const establishmentsWithoutSiren = await Establishment.find({ siren: null });

    await asyncForEach(establishmentsWithoutSiren, async etablissementWithoutSiren => {
      if (etablissementWithoutSiren.siret) {
        const sirenUpdate = { siren: etablissementWithoutSiren.siret.substring(0, 9) }; // Siren = Substring (0-9) of Siret
        await Establishment.findOneAndUpdate({ _id: etablissementWithoutSiren._id }, sirenUpdate, { new: true });
      }
    });

    logger.info(" -- End Fix Missing Siren(s) -- ");
  } catch (err) {
    logger.error(err);
  }
};

run();
