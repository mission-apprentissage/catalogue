const path = require("path");

const PATH_FORMATION_APPRENTISSAGE_AFFELNET = path.join(__dirname, "../../assets/2020_05_12_AFFELNET");
//UAI	COMMUNE	ACADEMIE	MINISTERE	TYPE_ETABLISSEMENT	MNEMONIQUE_FORMATION_ACCUEIL	CODE_SPECIALITE_FORMATION_ACCUEIL	LIBELLE_FORMATION_ACCUEIL_BAN	CODE_FORMATION_ACCUEIL_BAN	CODE_COMMUNE_INSEE	CODE_POSTAL

const infosCodes = {
  affelnet: {
    Error: 0,
    NotFound: 1,
    Found: 2,
    NothingDoTo: 3,
    Updated: 4,
    FoundMultiple: 5,
  },
};

const computeCodes = {
  affelnet: ["Erreur", "Non trouvé", "Trouvé", "Ok", "Mis à jour", "Multiple"],
};

module.exports = {
  PATH_FORMATION_APPRENTISSAGE_AFFELNET,
  infosCodes,
  computeCodes,
};
