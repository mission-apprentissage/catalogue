const mongoose = require("mongoose");
const { mongoosastic, getElasticInstance } = require("../esClient");

const MODELNAME = "formations";

const trainingSchema = {
  etablissement_formateur_id: {
    type: Object,
    default: null,
    documentation: {
      description: "Identifiant établissement formateur",
    },
  },
  etablissement_formateur_siret: {
    type: String,
    default: "",
    documentation: {
      description: "Numéro siret formateur",
    },
  },
  etablissement_formateur_siret_intitule: {
    type: String,
    default: "",
    documentation: {
      description: "Raison social établissement formateur",
    },
  },
  etablissement_formateur_uai: {
    type: String,
    default: "",
    documentation: {
      description: "UAI de l'etablissement formateur",
    },
  },
  etablissement_formateur_type: {
    type: String,
    default: "",
    documentation: {
      description: "Etablissement formateur est un CFA ou un OF",
    },
  },
  etablissement_formateur_conventionne: {
    type: String,
    default: "",
    documentation: {
      description: "Etablissement formateur est conventionné ou pas",
    },
  },
  etablissement_formateur_declare_prefecture: {
    type: String,
    default: "",
    documentation: {
      description: "Etablissement formateur est déclaré en prefecture",
    },
  },
  etablissement_formateur_datadock: {
    type: String,
    default: "",
    documentation: {
      description: "Etablissement formateur est connu de datadock",
    },
  },
  etablissement_formateur_published: {
    type: Boolean,
    default: false,
    documentation: {
      description: "Etablissement formateur entre dans le catalogue",
    },
  },
  etablissement_responsable_id: {
    type: Object,
    default: null,
    documentation: {
      description: "Identifiant établissement responable",
    },
  },
  etablissement_responsable_siret: {
    type: String,
    default: "",
    documentation: {
      description: "Numéro siret responsable",
    },
  },
  etablissement_responsable_siret_intitule: {
    type: String,
    default: "",
    documentation: {
      description: "Raison social établissement responsable",
    },
  },
  etablissement_responsable_uai: {
    type: String,
    default: "",
    documentation: {
      description: "UAI de l'etablissement responsable",
    },
  },
  etablissement_responsable_type: {
    type: String,
    default: "",
    documentation: {
      description: "Etablissement responsable est un CFA ou un OF",
    },
  },
  etablissement_responsable_conventionne: {
    type: String,
    default: "",
    documentation: {
      description: "Etablissement responsable est conventionné ou pas",
    },
  },
  etablissement_responsable_declare_prefecture: {
    type: String,
    default: "",
    documentation: {
      description: "Etablissement responsable est déclaré en prefecture",
    },
  },
  etablissement_responsable_datadock: {
    type: String,
    default: "",
    documentation: {
      description: "Etablissement responsable est connu de datadock",
    },
  },
  etablissement_responsable_published: {
    type: Boolean,
    default: false,
    documentation: {
      description: "Etablissement responsable entre dans le catalogue",
    },
  },
  etablissement_reference: {
    type: String,
    default: "",
    documentation: {
      description:
        "Etablissement reference est égale à l'établissement formateur ou responsable (formateur | responsable)",
    },
  },
  etablissement_reference_id: {
    type: Object,
    default: null,
    documentation: {
      description: "Identifiant établissement reference",
    },
  },
  etablissement_reference_type: {
    type: String,
    default: "",
    documentation: {
      description: "Etablissement reference est un CFA ou un OF",
    },
  },
  etablissement_reference_conventionne: {
    type: String,
    default: "",
    documentation: {
      description: "Etablissement reference est conventionné ou pas",
    },
  },
  etablissement_reference_declare_prefecture: {
    type: String,
    default: "",
    documentation: {
      description: "Etablissement reference est déclaré en prefecture",
    },
  },
  etablissement_reference_datadock: {
    type: String,
    default: "",
    documentation: {
      description: "Etablissement reference est connu de datadock",
    },
  },
  etablissement_reference_published: {
    type: Boolean,
    default: false,
    documentation: {
      description: "Etablissement reference entre dans le catalogue",
    },
  },
  siren: {
    type: String,
    default: "",
    documentation: {
      description: "Numéro siren",
    },
  },
  nom_academie: {
    type: String,
    default: "",
    documentation: {
      description: "Nom de l'académie",
    },
  },
  num_academie: {
    type: Number,
    default: 0,
    documentation: {
      description: "Numéro de l'académie",
    },
  },
  nom_academie_siege: {
    type: String,
    default: "",
    documentation: {
      description: "Nom de l'académie siége",
    },
  },
  num_academie_siege: {
    type: Number,
    default: 0,
    documentation: {
      description: "Numéro de l'académie siége",
    },
  },
  code_postal: {
    type: String,
    default: "",
    documentation: {
      description: "Code postal",
    },
  },
  code_commune_insee: {
    type: String,
    default: "",
    documentation: {
      description: "Code commune INSEE",
    },
  },
  num_departement: {
    type: String,
    default: "",
    documentation: {
      description: "Numéro de departement",
    },
  },
  ds_id_dossier: {
    type: String,
    default: "",
    documentation: {
      description: "Numéro de dossier Démarche Simplifiée",
    },
  },
  uai_formation: {
    type: String,
    default: "",
    documentation: {
      description: "UAI de la formation",
    },
  },
  nom: {
    type: String,
    default: "",
    documentation: {
      description: "Nom de la formation",
    },
  },
  intitule: {
    type: String,
    default: "",
    documentation: {
      description: "Intitulé de la formation normalisé BCN",
    },
  },
  diplome: {
    type: String,
    default: "",
    documentation: {
      description: "Diplôme ou titre visé",
    },
  },
  niveau: {
    type: String,
    default: "",
    documentation: {
      description: "Niveau de la formation",
    },
  },
  educ_nat_code: {
    type: String,
    default: "",
    documentation: {
      description: "Code education nationale",
    },
  },
  educ_nat_specialite_lettre: {
    type: String,
    default: "",
    documentation: {
      description: "Lettre spécialité du code education nationale",
    },
  },
  educ_nat_specialite_libelle: {
    type: String,
    default: "",
    documentation: {
      description: "Libellé spécialité du code education nationale",
    },
  },
  educ_nat_specialite_libelle_court: {
    type: String,
    default: "",
    documentation: {
      description: "Libellé court spécialité du code education nationale",
    },
  },
  mef_10_code: {
    type: String,
    default: "",
    documentation: {
      description: "Code MEF 10 caractères",
    },
  },
  mef_8_code: {
    type: String,
    default: "",
    documentation: {
      description: "Code MEF 8 caractères",
    },
  },
  mef_8_codes: {
    type: [String],
    default: [],
    documentation: {
      description: "List des codes MEF 8 caractères",
    },
  },
  rncp_code: {
    type: String,
    default: "",
    documentation: {
      description: "Code RNCP",
    },
  },
  rncp_eligible_apprentissage: {
    type: Boolean,
    default: false,
    documentation: {
      description: "Le titre RNCP est éligible en apprentissage",
    },
  },
  rncp_etablissement_formateur_habilite: {
    type: Boolean,
    default: false,
    documentation: {
      description: "Etablissement formateur est habilité RNCP ou pas",
    },
  },
  rncp_etablissement_responsable_habilite: {
    type: Boolean,
    default: false,
    documentation: {
      description: "Etablissement responsable est habilité RNCP ou pas",
    },
  },
  rncp_etablissement_reference_habilite: {
    type: Boolean,
    default: false,
    documentation: {
      description: "Etablissement reference est habilité RNCP ou pas",
    },
  },
  rome_codes: {
    type: [String],
    default: [],
    documentation: {
      description: "Codes ROME",
    },
  },
  periode: {
    type: String,
    default: "",
    documentation: {
      description: "Période d'inscription à la formation",
    },
  },
  capacite: {
    type: String,
    default: "",
    documentation: {
      description: "Capacité d'accueil",
    },
  },
  duree: {
    type: String,
    default: "",
    documentation: {
      description: "Durée de la formation en années",
    },
  },
  annee: {
    type: String,
    default: "",
    documentation: {
      description: "Année de la formation (cursus)",
    },
  },
  email: {
    type: String,
    default: "",
    documentation: {
      description: "Email du contact pour cette formation",
    },
  },
  parcoursup_reference: {
    type: String,
    default: "NON",
    documentation: {
      description: "La formation est présent sur parcourSup",
    },
  },
  info_bcn_code_en: {
    type: Number,
    default: 0,
    documentation: {
      description: "le codeEn est présent ou pas dans la base BCN",
    },
  },
  info_bcn_intitule: {
    type: Number,
    default: 0,
    documentation: {
      description: "l'intitulé est présent ou pas dans la base BCN",
    },
  },
  info_bcn_niveau: {
    type: Number,
    default: 0,
    documentation: {
      description: "Niveau a été mis à jour par la base BCN",
    },
  },
  info_bcn_diplome: {
    type: Number,
    default: 0,
    documentation: {
      description: "Diplome a été mis à jour par la base BCN",
    },
  },
  info_bcn_mef: {
    type: Number,
    default: 0,
    documentation: {
      description: "code MEF 10 a été créé ou mis à jour par la base BCN",
    },
  },
  computed_bcn_code_en: {
    type: String,
    default: "",
    documentation: {
      description: "Valeur intelligible evaluée",
    },
  },
  computed_bcn_intitule: {
    type: String,
    default: "",
    documentation: {
      description: "Valeur intelligible evaluée",
    },
  },
  computed_bcn_niveau: {
    type: String,
    default: "",
    documentation: {
      description: "Valeur intelligible evaluée",
    },
  },
  computed_bcn_diplome: {
    type: String,
    default: "",
    documentation: {
      description: "Valeur intelligible evaluée",
    },
  },
  computed_bcn_mef: {
    type: String,
    default: "",
    documentation: {
      description: "Valeur intelligible evaluée",
    },
  },
  source: {
    type: String,
    default: "",
    documentation: {
      description: "Origine de la formation",
    },
  },
  commentaires: {
    type: String,
    default: "",
    documentation: {
      description: "Commentaire",
    },
  },
  last_modification: {
    type: String,
    default: "",
    documentation: {
      description: "Qui a réalisé la derniere modification",
    },
  },
  to_verified: {
    type: Boolean,
    default: false,
    documentation: {
      description: "Formation à vérifier manuellement",
    },
  },
  published_old: {
    type: Boolean,
    default: false,
    documentation: {
      description: "ancien published à re-verifier coté métier 588 false",
    },
  },
  published: {
    type: Boolean,
    default: false,
    documentation: {
      description: "Est publiée, la formation est éligible pour le catalogue général",
    },
  },
  created_at: {
    type: Date,
    default: Date.now,
    documentation: {
      description: "Date d'ajout en base de données",
    },
  },
  last_update_at: {
    type: Date,
    default: Date.now,
    documentation: {
      description: "Date de dernières mise à jour",
    },
  },
};

exports.Schema = trainingSchema;

const attachFormationTo = (mongooseInstance, stage) => {
  const Schema = new mongooseInstance.Schema(trainingSchema);
  Schema.plugin(mongoosastic, { esClient: getElasticInstance(stage), index: MODELNAME });
  const OBJ = mongooseInstance.model(MODELNAME, Schema);
  return OBJ;
};

const Schema = new mongoose.Schema(trainingSchema);
Schema.plugin(mongoosastic, { esClient: getElasticInstance(), index: MODELNAME });
const OBJ = mongoose.model(MODELNAME, Schema);
module.exports = OBJ;

module.exports = {
  Formation: OBJ,
  attachFormationTo,
};
