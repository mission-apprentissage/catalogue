const apiGeoAdresse = require("../../common/apiGeoAdresse");

class GeoAdresseData {
  constructor() {}

  getAddress(numero_voie, type_voie, nom_voie, code_postal, localite) {
    return `https://api-adresse.data.gouv.fr/search/?q=${numero_voie ? numero_voie + "+" : ""}${
      type_voie ? type_voie + "+" : ""
    }+${nom_voie ? nom_voie : ""}&postcode=${code_postal} - ${localite}`;
  }

  // le code postal 75116 ne remonte rien, il doit être remplacé par 75016
  refinePostcode(postcode) {
    if (postcode === "75116") return "75016";
    else if (postcode === "97142") return "97139";
    //TODO: hardcoded à supprimer quand la BAN remontera correctement les adresse du cp 97142 pour "Les Abymes" en Guadeloupe
    else return postcode;
  }

  async getGeoCoordinateFromAdresse({ numero_voie, type_voie, nom_voie, code_postal, localite }) {
    // première tentative de recherche sur rue et code postal

    if (code_postal === "97133") {
      //TODO: hardcoded à supprimer quand la BAN remontera correctement les adresse du cp 97133 pour "Saint Barthélémy"
      // cas particulier concernant un unique college à saint barth'
      return {
        geo_coordonnees: "17.896279,-62.849772", // format "lat,long"
      };
    }

    if (!code_postal) {
      console.info(
        `No postcode for establishment.\t${this.getAddress(numero_voie, type_voie, nom_voie, code_postal, localite)}`
      );
      return {
        geo_coordonnees: null,
      };
    }

    let responseApiAdresse = await apiGeoAdresse.search(
      `${numero_voie ? numero_voie + "+" : ""}${type_voie ? type_voie + "+" : ""}${nom_voie ? nom_voie : ""}`,
      this.refinePostcode(code_postal)
    );

    // si pas de réponse deuxième recherche sur ville et code postal
    if (!responseApiAdresse || responseApiAdresse.features.length === 0) {
      console.info(`Second geoloc call with postcode and city\t${localite} ${code_postal}`);
      responseApiAdresse = await apiGeoAdresse.searchPostcodeOnly(
        `${localite ? localite : "a"}`, // hack si localite absente
        this.refinePostcode(code_postal)
      );
    }

    if (!responseApiAdresse)
      return {
        geo_coordonnees: null,
      };

    if (responseApiAdresse.features.length === 0) {
      console.info(
        `No geoloc result for establishment.\t${this.getAddress(
          numero_voie,
          type_voie,
          nom_voie,
          code_postal,
          localite
        )}`
      );
      return {
        geo_coordonnees: null,
      };
    }

    // signalement des cas avec ambiguité
    if (responseApiAdresse.features.length > 1) {
      console.info(
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

const geoAdresseData = new GeoAdresseData();
module.exports = geoAdresseData;
