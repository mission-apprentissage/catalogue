const DomainesMetiersSchema = {
  sous_domaine: {
    type: String,
    default: null,
    description: "Le sous-domaine d'un métier",
  },
  domaine: {
    type: String,
    default: null,
    description: "Le grand domaine d'un métier",
  },
  domaines: {
    type: [String],
    default: [],
    description: "Les domaines d'un métier",
  },
  familles: {
    type: [String],
    default: [],
    description: "Les familles associées au métier",
  },
  codes_romes: {
    type: [String],
    default: [],
    description: "Les codes Romes associés au métier",
  },
  intitules_romes: {
    type: [String],
    default: [],
    description: "Les libellés des codes ROMEs associés au métier",
  },
  /*codes_rncps: {
    type: [String],
    default: [],
    description: "Les codes RNCPs associés au métier",
  },*/
  mots_clefs: {
    type: String,
    default: null,
    description: "Les mots clefs associés au métier",
  },
  couples_romes_metiers: {
    type: [Object],
    default: [],
    description: "Couples codes ROMEs / intitulés correspondants au métier",
  },
  created_at: {
    type: Date,
    default: Date.now,
    description: "Date d'ajout en base de données",
  },
  last_update_at: {
    type: Date,
    default: Date.now,
    description: "Date de dernières mise à jour",
  },
};

module.exports = DomainesMetiersSchema;
