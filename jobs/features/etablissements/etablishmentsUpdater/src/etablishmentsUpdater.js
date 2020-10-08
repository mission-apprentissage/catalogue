const { connectToMongo, closeMongoConnection } = require("../../../../../common/mongo");
const { Establishment } = require("../../../../../common/models2");

const logger = require("../../../../common-jobs/Logger").mainLogger;
const asyncForEach = require("../../../../common-jobs/utils").asyncForEach;
const referentielGeographique = require("../../../../common-jobs/referentielGeographique");
const entrepriseApiData = require("./updaters/entrepriseApiData");
const conventionnementData = require("./updaters/conventionnementData");
const academieData = require("./updaters/academieData");
const formationsData = require("./updaters/formationsData");
const geoData = require("./updaters/geoData");
const publishedData = require("./updaters/publishedData");

const proccess = async updatedEstablishment => {
  try {
    let updatedNeeded = false;

    // Update entreprise API information
    const {
      result: updatesEntrepriseApiData,
      establishmentSiege: establishmentToCreate,
    } = await entrepriseApiData.getUpdates(updatedEstablishment);
    if (establishmentToCreate) {
      await proccess({
        ...establishmentToCreate._doc,
      });
    }
    if (updatesEntrepriseApiData) {
      updatedEstablishment = {
        ...updatedEstablishment,
        ...updatesEntrepriseApiData,
      };
      updatedNeeded = true;
    }

    // Update formations information
    const updatesFormationData = await formationsData.getUpdates(updatedEstablishment);
    if (updatesFormationData) {
      updatedEstablishment = {
        ...updatedEstablishment,
        ...updatesFormationData,
      };
      updatedNeeded = true;
    }

    // Update geolocation information
    const updatesGeoData = await geoData.getFirstMatchUpdates(updatedEstablishment);
    if (updatesGeoData) {
      updatedEstablishment = {
        ...updatedEstablishment,
        ...updatesGeoData,
      };
      updatedNeeded = true;
    }

    // // Update academie information
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

    const updatesPublishedData = await publishedData.getUpdates(updatedEstablishment);
    if (updatesPublishedData) {
      updatedEstablishment = {
        ...updatedEstablishment,
        ...updatesPublishedData,
      };
      updatedNeeded = true;
    }

    delete updatedEstablishment.numero_tva_intracommunautaire;
    delete updatedEstablishment.code_effectif_entreprise;
    delete updatedEstablishment.forme_juridique_code;
    delete updatedEstablishment.forme_juridique;
    delete updatedEstablishment.raison_sociale;
    delete updatedEstablishment.nom_commercial;
    delete updatedEstablishment.capital_social;
    delete updatedEstablishment.nom;
    delete updatedEstablishment.prenom;
    delete updatedEstablishment.uais_formations;
    delete updatedEstablishment.siret_siege_social;
    // effacement ancien bloc localisation remplacé par geo_coords
    delete updatedEstablishment.localisation_coordonnees_lon;
    delete updatedEstablishment.localisation_coordonnees_lat;
    delete updatedEstablishment.localisation_geojson;

    // Update establishment
    if (updatedNeeded) {
      updatedEstablishment.last_update_at = Date.now();
      try {
        await Establishment.findOneAndUpdate({ _id: updatedEstablishment._id }, updatedEstablishment, {
          new: true,
        });
        logger.info(`Establishment ${updatedEstablishment._id} has been updated`);
      } catch (error) {
        logger.info(`Establishment ${updatedEstablishment._id} has been updated`);
      }
    } else {
      logger.info(`Establishment ${updatedEstablishment._id} nothing to do`);
    }
  } catch (err) {
    logger.error(err);
  }
};

const run = async (updateOnly = null, connectMongo = true) => {
  try {
    logger.info(" -- Start of Establishments updater -- ");

    await referentielGeographique.importReferentiel();

    if (connectMongo) {
      await connectToMongo();
    }

    const filter = !updateOnly ? {} : updateOnly;

    const establishments = await Establishment.find(filter);

    await asyncForEach(establishments, async establishmentItem => {
      let updatedEstablishment = {
        ...establishmentItem._doc,
      };
      await proccess(updatedEstablishment);
    });

    if (connectMongo) {
      closeMongoConnection();
    }
    logger.info(" -- End of Establishments updater -- ");
  } catch (err) {
    logger.error(err);
  }
};

module.exports.run = run;
