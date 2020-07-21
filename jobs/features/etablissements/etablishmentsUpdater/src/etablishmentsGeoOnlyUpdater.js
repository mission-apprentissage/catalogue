const { connectToMongo, closeMongoConnection } = require("../../../../../common/mongo");
const { Establishment } = require("../../../../../common/models2");

const logger = require("../../../../common-jobs/Logger").mainLogger;
const asyncForEach = require("../../../../common-jobs/utils").asyncForEach;
const referentielGeographique = require("../../../../common-jobs/referentielGeographique");
const geoData = require("./updaters/geoData");

const proccess = async updatedEstablishment => {
  try {
    let updatedNeeded = false;

    // Update geolocation information
    const updatesGeoData = await geoData.getFirstMatchUpdates(updatedEstablishment);
    if (updatesGeoData) {
      updatedEstablishment = {
        ...updatedEstablishment,
        ...updatesGeoData,
      };
      updatedNeeded = true;
    }

    // Update establishment
    if (updatedNeeded) {
      updatedEstablishment.last_update_at = Date.now();
      try {
        await Establishment.findOneAndUpdate({ _id: updatedEstablishment._id }, updatedEstablishment, {
          new: true,
        });
        //logger.info(`Establishment ${updatedEstablishment._id} has been updated`);
      } catch (error) {
        //logger.info(`Establishment ${updatedEstablishment._id} has been updated`);
      }
    } else {
      logger.info(`Establishment ${updatedEstablishment._id} nothing to do`);
    }
  } catch (err) {
    logger.error(err);
  }
};

const run = async (updateOnly = null) => {
  try {
    logger.info(" -- Start of Establishments Geo Only updater -- ");

    await referentielGeographique.importReferentiel();

    await connectToMongo();

    const filter = !updateOnly ? {} : updateOnly;

    const establishments = await Establishment.find(filter);

    await asyncForEach(establishments, async establishmentItem => {
      let updatedEstablishment = {
        ...establishmentItem._doc,
      };
      await proccess(updatedEstablishment);
    });

    closeMongoConnection();

    logger.info(" -- End of Establishments updater -- ");
  } catch (err) {
    logger.error(err);
  }
};

module.exports.run = run;
