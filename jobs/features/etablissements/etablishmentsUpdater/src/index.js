const { connectToMongo } = require("../../../../common/mongo");
const { Establishment } = require("../../../../common/models");
const logger = require("../../../../common/Logger").mainLogger;
const asyncForEach = require("../../../../common/utils").asyncForEach;
const entrepriseApiData = require("./updaters/entrepriseApiData");
const conventionnementData = require("./updaters/conventionnementData");
const academieData = require("./updaters/academieData");

const UPDATE_ALL = true;
const UPDATE_ONLY = { attr: "siren", value: "321591646" };

const run = async () => {
  try {
    logger.info(" -- Start of Establishments updater -- ");
    await connectToMongo();

    const establishments = await Establishment.find({});

    await asyncForEach(establishments, async establishmentItem => {
      if (UPDATE_ALL || establishmentItem[UPDATE_ONLY.attr] === UPDATE_ONLY.value) {
        let updatedEstablishment = {
          ...establishmentItem._doc,
        };
        let updatedNeeded = false;

        // Update entreprise API information
        const updatesEntrepriseApiData = await entrepriseApiData.getUpdates(updatedEstablishment);
        if (updatesEntrepriseApiData) {
          updatedEstablishment = {
            ...updatedEstablishment,
            ...updatesEntrepriseApiData,
          };
          updatedNeeded = true;
        }

        // Update academie information
        const updatesAcademieData = await academieData.getUpdates(updatedEstablishment);
        if (updatesAcademieData) {
          updatedEstablishment = {
            ...updatedEstablishment,
            ...updatesAcademieData,
          };
          updatedNeeded = true;
        }

        // Update conventionnement information
        const updatesConventionnementData = conventionnementData.getUpdates(updatedEstablishment);
        if (updatesConventionnementData) {
          updatedEstablishment = {
            ...updatedEstablishment,
            ...updatesConventionnementData,
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
            logger.info(`Establishment ${establishmentItem._id} has been updated`);
          } catch (error) {
            logger.info(`Establishment ${establishmentItem._id} has been updated`);
          }
        } else {
          logger.info(`Establishment ${establishmentItem._id} nothing to do`);
        }
      }
    });

    logger.info(" -- End of Establishments updater -- ");
  } catch (err) {
    logger.error(err);
  }
};

run();
