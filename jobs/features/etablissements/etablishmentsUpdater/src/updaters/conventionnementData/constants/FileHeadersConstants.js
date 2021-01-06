const FichierDeppHeader = [
  "numero_uai",
  "secteur_public_prive",
  "secteur_public_prive_libe",
  "commune",
  "commune_libe",
  "academie",
  "academie_libe",
  "denomination_principale",
  "appellation_officielle",
  "patronyme_uai",
  "mel_uai",
];

const DataDockFileHeader = [
  "id_etablissement_mna",
  "siren",
  "siret_siege_social",
  "siret",
  "RAISON SOCIALE",
  "REFERENCABLE",
];

const DGEFPFileHeader = [
  "siren",
  "numEtablissment",
  "raison_social",
  "sigle",
  "email",
  "telephone",
  "region",
  "departement",
];

module.exports = {
  DataDockFileHeader,
  FichierDeppHeader,
  DGEFPFileHeader,
};
