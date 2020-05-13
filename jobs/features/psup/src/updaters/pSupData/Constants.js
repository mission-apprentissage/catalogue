const path = require("path");

const PATH_FORMATION_APPRENTISSAGE_PSUP = path.join(__dirname, "../../assets/listeFormationApprentissagePsup.csv");

const infosCodes = {
  psup: {
    Error: 0,
    NotFound: 1,
    Found: 2,
    NothingDoTo: 3,
    Updated: 4,
    FoundMultiple: 5,
  },
};

const computeCodes = {
  psup: ["Erreur", "Non trouvé", "Trouvé", "Ok", "Mis à jour", "Multiple"],
};

module.exports = {
  PATH_FORMATION_APPRENTISSAGE_PSUP,
  infosCodes,
  computeCodes,
};
