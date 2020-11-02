const path = require("path");

const PATH_RCO_EXPORT = path.join(__dirname, "../../assets/RCO_20200625.xlsx");
const PATH_RCO_EXPORT_OLD = path.join(__dirname, "../../assets/RCO_20200213.xlsx");

const infosCodes = {
  rco: {
    Error: 0,
    NotFound: 1,
    Found: 2,
    NothingDoTo: 3,
    Updated: 4,
    FoundMultiple: 5,
    FoundSuper: 6,
    FoundPerfect: 7,
  },
};

const computeCodes = {
  rco: ["Erreur", "Non trouvé", "Trouvé", "Ok", "Mis à jour", "Multiple", "Trouvé bon", "Trouvé très bon"],
};

module.exports = {
  PATH_RCO_EXPORT,
  PATH_RCO_EXPORT_OLD,
  infosCodes,
  computeCodes,
};
