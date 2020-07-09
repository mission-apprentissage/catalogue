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

  getAddress(numero_voie, type_voie, nom_voie, code_postal, localite) {
    return `https://api-adresse.data.gouv.fr/search/?q=${numero_voie ? numero_voie + "+" : ""}${
      type_voie ? type_voie + "+" : ""
    }+${nom_voie ? nom_voie : ""}&postcode=${code_postal} - ${localite}`;
  }

  // le code postal 75116 ne remonte rien, il doit être remplacé par 75016
  refinePostcode(postcode) {
    if (postcode === "75116") return "75016";
    else return postcode;
  }

  async getFirstMatchUpdates({ numero_voie, type_voie, nom_voie, code_postal, localite }) {
    // première tentative de recherche sur rue et code postal

    if (!code_postal) {
      logger.info(
        `No postcode for establishment.\t${this.getAddress(numero_voie, type_voie, nom_voie, code_postal, localite)}`
      );
      return false;
    }

    let responseApiAdresse = await apiGeoAdresse.search(
      `${numero_voie ? numero_voie + "+" : ""}${type_voie ? type_voie + "+" : ""}${nom_voie ? nom_voie : ""}`,
      this.refinePostcode(code_postal)
    );

    // si pas de réponse deuxième recherche sur ville et code postal
    if (!responseApiAdresse || responseApiAdresse.features.length === 0) {
      logger.info(`Second geoloc call with postcode and city\t${localite} ${code_postal}`);
      responseApiAdresse = await apiGeoAdresse.searchPostcodeOnly(
        `${localite ? localite : "a"}`, // hack si localite absente
        this.refinePostcode(code_postal)
      );
    }

    if (!responseApiAdresse) return false;

    if (responseApiAdresse.features.length === 0) {
      logger.info(
        `No geoloc result for establishment.\t${this.getAddress(
          numero_voie,
          type_voie,
          nom_voie,
          code_postal,
          localite
        )}`
      );
      return false;
    }

    // signalement des cas avec ambiguité
    if (responseApiAdresse.features.length > 1) {
      logger.info(
        `Multiple geoloc results for establishment.\t${this.getAddress(
          numero_voie,
          type_voie,
          nom_voie,
          code_postal,
          localite
        )}\t${responseApiAdresse.features[0].properties.label} ${responseApiAdresse.features[0].properties.postcode}`
      );
    }

    const geojson = { ...responseApiAdresse };

    return {
      geo_coordonnees: `${geojson.features[0].geometry.coordinates[1]},${geojson.features[0].geometry.coordinates[0]}`, // format "lat,long"
    };
  }
}

const geoData = new GeoData();
module.exports = geoData;
