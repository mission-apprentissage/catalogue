const apiGeoAdresse = require("../services/apiGeoAdresse");

class GeoData {
  constructor() {}

  async getUpdates({ numero_voie, type_voie, nom_voie, code_postal }) {
    const responseApiAdresse = await apiGeoAdresse.search(`${numero_voie}+${type_voie}+${nom_voie}`, code_postal);
    if (responseApiAdresse.features.length !== 1) {
      return false;
    }
    const geojson = { ...responseApiAdresse };

    return {
      geo_coords: `${geojson.features[0].geometry.coordinates[1]},${geojson.features[0].geometry.coordinates[0]}`,  // format "lat,long"
    };
  }
}

const geoData = new GeoData();
module.exports = geoData;
