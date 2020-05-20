//const logger = require("../../../../../common-jobs/Logger").mainLogger;
const apiGeoAdresse = require("../services/apiGeoAdresse");

class GeoData {
  constructor() {}

  async getUpdates({ numero_voie, type_voie, nom_voie, code_postal }) {
    const responseApiAdresse = await apiGeoAdresse.search(`${numero_voie}+${type_voie}+${nom_voie}`, code_postal);
    if (responseApiAdresse.features.length !== 1) {
      return false;
    }
    const geojson = { ...responseApiAdresse };
    delete geojson.limit;
    delete geojson.filters;
    delete geojson.query;
    delete geojson.licence;
    delete geojson.attribution;
    delete geojson.version;

    return {
      localisation_geojson: geojson,
      localisation_coordonnees_lon: geojson.features[0].geometry.coordinates[0],
      localisation_coordonnees_lat: geojson.features[0].geometry.coordinates[1],
    };
  }
}

const geoData = new GeoData();
module.exports = geoData;
