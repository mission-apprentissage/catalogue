const apiGeoAdresse = require("../services/apiGeoAdresse");
const logger = require("../../../../../common-jobs/Logger").mainLogger;

class GeoData {
  constructor() {}

  async getUpdates({ numero_voie, type_voie, nom_voie, code_postal }) {
    const responseApiAdresse = await apiGeoAdresse.search(`${numero_voie}+${type_voie}+${nom_voie}`, code_postal);
    if (responseApiAdresse.features.length !== 1) {
      return false;
    }
    const geojson = { ...responseApiAdresse };

    return {
      geo_coordonnees: `${geojson.features[0].geometry.coordinates[1]},${geojson.features[0].geometry.coordinates[0]}`, // format "lat,long"
    };
  }

  getAddress(numero_voie, type_voie, nom_voie, code_postal) {
    return `https://api-adresse.data.gouv.fr/search/?q=${numero_voie ? numero_voie + "+" : ""}${
      type_voie ? type_voie + "+" : ""
    }+${nom_voie ? nom_voie : ""}&postcode=${code_postal}`;
  }

  async getFirstMatchUpdates({ numero_voie, type_voie, nom_voie, code_postal }) {
    const responseApiAdresse = await apiGeoAdresse.search(
      `${numero_voie ? numero_voie + "+" : ""}${type_voie ? type_voie + "+" : ""}+${nom_voie ? nom_voie : ""}`,
      code_postal
    );
    if (responseApiAdresse.features.length > 1) {
      logger.info(
        `Multiple geoloc results for establishment.\t${this.getAddress(
          numero_voie,
          type_voie,
          nom_voie,
          code_postal
        )}\t${responseApiAdresse.features[0].properties.label} ${
          responseApiAdresse.features[0].properties.postcode
        }`
      );
    }
    if (responseApiAdresse.features.length === 0) {
      logger.info(
        `No geoloc result for establishment.\t${this.getAddress(numero_voie, type_voie, nom_voie, code_postal)}`
      );
      return false;
    }
    const geojson = { ...responseApiAdresse };

    return {
      geo_coordonnees: `${geojson.features[0].geometry.coordinates[1]},${geojson.features[0].geometry.coordinates[0]}`, // format "lat,long"
    };
  }
}

const geoData = new GeoData();
module.exports = geoData;
