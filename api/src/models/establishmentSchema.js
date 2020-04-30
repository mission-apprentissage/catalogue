const establishmentSchema = {
  siret: {
    type: String,
    default: null,
    description: "Numéro siret",
  },
  siren: {
    type: String,
    default: null,
    description: "Numéro siren",
  },
  numero_tva_intracommunautaire: {
    type: String,
    default: null,
    description: "Numéro de TVA intracommunautaire",
  },
  naf_code: {
    type: String,
    default: null,
    description: "Code NAF",
  },
  naf_libelle: {
    type: String,
    default: null,
    description: "Libellé du code NAT (ex: Enseignement secondaire technique ou professionnel)",
  },
  code_effectif_entreprise: {
    type: String,
    default: null,
    description: "Code éffectf",
  },
  forme_juridique_code: {
    type: String,
    default: null,
    description: "Code forme juridique",
  },
  forme_juridique: {
    type: String,
    default: null,
    description: "Forme juridique (ex: Établissement public local d'enseignement)",
  },
  raison_sociale: {
    type: String,
    default: null,
    description: "Raison sociale",
  },
  nom_commercial: {
    type: String,
    default: null,
    description: "Nom commercial",
  },
  capital_social: {
    type: String,
    default: null,
    description: "Capital social",
  },
  date_creation: {
    type: String,
    default: null,
    description: "Date de création",
  },
  date_fermeture: {
    type: Date,
    default: null,
    description: "Date de cessation d'activité",
  },
  ferme: {
    type: Boolean,
    default: false,
    description: "A cessé son activité",
  },
  siret_siege_social: {
    type: String,
    default: null,
    description: "Numéro siret du siége sociale",
  },
  siege_social: {
    type: Boolean,
    default: false,
    description: "Siége sociale",
  },
  adresse: {
    type: String,
    default: null,
    description: "Adresse de l'établissement",
  },
  complement_adresse: {
    type: String,
    default: null,
    description: "Complément d'adresse de l'établissement",
  },
  numero_voie: {
    type: String,
    default: null,
    description: "Numéro de la voie",
  },
  type_voie: {
    type: String,
    default: null,
    description: "Type de voie (ex: rue, avenue)",
  },
  nom_voie: {
    type: String,
    default: null,
    description: "Nom de la voie",
  },
  code_postal: {
    type: String,
    default: null,
    description: "Code postal",
  },
  localite: {
    type: String,
    default: null,
    description: "Localité",
  },
  code_insee_localite: {
    type: String,
    default: null,
    description: "Code Insee localité",
  },
  num_academie: {
    type: Number,
    default: 0,
    description: "Numéro de l'académie",
  },
  nom: {
    type: String,
    default: null,
    description: "Nom du contact",
  },
  prenom: {
    type: String,
    default: null,
    description: "Prénom du contact",
  },
  ds_id_dossier: {
    type: String,
    default: null,
    description: "Numéro de dossier Démarche Simplifiée",
  },
  ds_questions_siren: {
    type: String,
    default: null,
    description: "Numéro SIREN saisi dans Démarche Simplifiée",
  },
  ds_questions_nom: {
    type: String,
    default: null,
    description: "Nom du contact saisi dans Démarche Simplifiée",
  },
  ds_questions_email: {
    type: String,
    default: null,
    description: "Email du contact saisi dans Démarche Simplifiée",
  },
  ds_questions_uai: {
    type: String,
    default: null,
    description: "UAI saisi dans Démarche Simplifiée",
  },
  ds_questions_has_agrement_cfa: {
    type: String,
    default: null,
    description: 'Réponse à la question "Avez vous l\'agrément CFA" dans Démarche Simplifiée',
  },
  ds_questions_has_certificaton_2015: {
    type: String,
    default: null,
    description: 'Réponse à la question "Avez vous la certification 2015" dans Démarche Simplifiée',
  },
  ds_questions_has_ask_for_certificaton: {
    type: String,
    default: null,
    description: 'Réponse à la question "Avez vous demandé la certification" dans Démarche Simplifiée',
  },
  ds_questions_ask_for_certificaton_date: {
    type: String,
    default: null,
    description: 'Réponse à la question "Date de votre demande de certification" dans Démarche Simplifiée',
  },
  ds_questions_declaration_code: {
    type: String,
    default: null,
    description: 'Réponse à la question "Numéro de votre déclaration" dans Démarche Simplifiée',
  },
  ds_questions_has_2020_training: {
    type: String,
    default: null,
    description: 'Réponse à la question "Proposez-vous des formations en 2020" dans Démarche Simplifiée',
  },
  uai: {
    type: String,
    default: null,
    description: "UAI de l'établissement",
  },
  uais_formations: {
    type: [String],
    default: [],
    description: "UAIs des formations rattachées à l'établissement",
  },

  info_depp: {
    type: Number,
    default: 0,
    description: "L'établissement est présent ou pas dans le fichier DEPP",
  },
  info_dgefp: {
    type: Number,
    default: 0,
    description: "L'établissement est présent ou pas dans le fichier DGEFP",
  },
  info_datagouv_ofs: {
    type: Number,
    default: 0,
    description: "L'établissement est présent ou pas dans le fichier datagouv",
  },
  info_datadock: {
    type: Number,
    default: 0,
    description: "L'établissement est présent ou pas dans le fichier dataDock",
  },
  computed_type: {
    type: String,
    default: null,
    description: "Type de l'établissement CFA ou OF",
  },
  computed_declare_prefecture: {
    type: String,
    default: null,
    description: "Etablissement est déclaré en prefecture",
  },
  computed_conventionne: {
    type: String,
    default: null,
    description: "Etablissement est conventionné ou pas",
  },
  computed_info_datadock: {
    type: String,
    default: null,
    description: "Etablissement est connu de datadock",
  },
  api_entreprise_reference: {
    type: Boolean,
    default: false,
    description: "L'établissement est trouvé via l'API Entreprise",
  },
  published: {
    type: Boolean,
    default: false,
    description: "Est publié",
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

module.exports = establishmentSchema;
