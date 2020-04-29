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

const DataDockFileHeader = ["idDossier", "siren", "siret", "siret_siege_social", "RAISON SOCIALE", "REFERENCABLE"];

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
