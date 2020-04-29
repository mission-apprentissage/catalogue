/*
    Champs formations sans validation connue
    "accessor": "nom_academie",
    "accessor": "ds_id_dossier",    
    "accessor": "etablissement_responsable_siret_intitule",    
    "accessor": "etablissement_formateur_siret_intitule",
    "accessor": "etablissement_reference_type",
    "accessor": "etablissement_reference_conventionne",
    "accessor": "etablissement_reference_declare_prefecture",
    "accessor": "etablissement_reference_datadock",
    "accessor": "source",
    "accessor": "diplome",
    "accessor": "intitule",
    "accessor": "nom_academie_siege",

  Champs établissements sans validation connue

    "accessor": "computed_type",
    "accessor": "computed_conventionne",
    "accessor": "computed_declare_prefecture",
    "accessor": "computed_info_datadock",
    "accessor": "capital_social",
    "accessor": "numero_tva_intracommunautaire",
    "accessor": "forme_juridique",
    "accessor": "forme_juridique_code",
    "accessor": "ds_questions_nom",
    "accessor": "raison_sociale",
    "accessor": "code_effectif_entreprise",
    "accessor": "date_creation",
    "accessor": "nom",
    "accessor": "prenom",
    "accessor": "naf_code",
    "accessor": "naf_libelle",
    "accessor": "adresse",
    "accessor": "numero_voie",
    "accessor": "type_voie",
    "accessor": "nom_voie",
    "accessor": "complement_adresse",
    "accessor": "localite"
*/

export const validateCell = (accessor, value) => {
  try {
    if (!fieldValidators.hasOwnProperty(accessor)) {
      throw new Error("field validator missing");
    }

    return fieldValidators[accessor](value);
  } catch (err) {
    console.log(err, accessor, value);
    return false;
  }
};

export const isValidSiret = (siret) => {
  return /^[0-9]{14}$/g.test(siret) || siret === "";
};

export const isValidSiren = (siren) => {
  return /^[0-9]{9}$/g.test(siren) || siren === "";
};

export const isValidCodeEducNat = (codeEducNat) => {
  if (/^[0-9A-Z]{8}$/g.test(codeEducNat)) {
    return /^(?!RNCP.*$).*/g.test(codeEducNat);
  }
  return false;
};

export const isValidNiveau = (niveau) => {
  return /(3 \(CAP...\)|4 \(Bac...\)|5 \(BTS, DUT...\)|6 \(Licence...\)|7 \(Master, titre ingénieur...\))/g.test(
    niveau
  );
};

export const isValidPeriode = (periode) => {
  // try {
  //   const test = eval(periode);
  //   return Array.isArray(test);
  // } catch (error) {
  //   return false;
  // }
  return true;
};

export const isValidCapacite = (capacite) => {
  return !isNaN(capacite) || capacite === "";
};

export const isValidDuree = (duree) => {
  return /^[0-9]{1}$/g.test(duree) || duree === "";
};

export const isValidAnnee = (annee) => {
  return /^[0-9]{1}$/g.test(annee) || annee === "";
};

export const isValidEmail = (email) => {
  return (
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/g.test(
      email
    ) || email === ""
  );
};

export const isValidUAI = (uai) => {
  return /^[0-9]{7}[a-zA-Z]{1}$/g.test(uai);
};

export const isValidCodePostal = (codePostal) => {
  return /^[0-9]{5}$/g.test(codePostal);
};

export const isValidCodeCommuneInsee = (codeCommuneInsee) => {
  return /^[0-9]{5}$/g.test(codeCommuneInsee);
};

export const isValidNumAcademie = (numAcademie) => {
  //console.log("isValidAc ", numAcademie, !isNaN(numAcademie), parseInt(numAcademie) < 50);
  return !isNaN(numAcademie) && parseInt(numAcademie) < 50;
};

export const isValidNumDepartement = (numDepartement) => {
  return !isNaN(numDepartement);
};

/* les fonctions de validations ci-dessous ne sont pas faits */
export const isValidNomAcademie = (value) => {
  return true;
};
export const isValidDatadock = (value) => {
  return true;
};
export const isValidConventionne = (value) => {
  return true;
};
export const isValidCapital = (value) => {
  return true;
};
export const isValidDateCreation = (value) => {
  return true;
};
export const isValidTva = (value) => {
  return true;
};
export const isValidNafCode = (value) => {
  return true;
};
export const isValidDiplome = (value) => {
  return value !== "";
};
export const isValidIntitule = (value) => {
  return value !== "";
};
export const isValidDummy = (value) => {
  return true;
};

const fieldValidators = {
  num_academie: isValidNumAcademie,
  num_academie_siege: isValidNumAcademie,
  num_departement: isValidNumDepartement,
  etablissement_responsable_siret: isValidSiret,
  etablissement_formateur_siret: isValidSiret,
  etablissement_responsable_uai: isValidUAI,
  etablissement_formateur_uai: isValidUAI,
  uai_formation: isValidUAI,
  educ_nat_code: isValidCodeEducNat,
  niveau: isValidNiveau,
  periode: isValidPeriode,
  code_postal: isValidCodePostal,
  code_commune_insee: isValidCodeCommuneInsee,
  capacite: isValidCapacite,
  duree: isValidDuree,
  annee: isValidAnnee,
  siret: isValidSiret,
  siret_siege_social: isValidSiret,
  uai: isValidUAI,
  siren: isValidSiren,
  code_insee_localite: isValidCodeCommuneInsee,

  nom_academie: isValidNomAcademie,
  ds_id_dossier: isValidDummy,
  etablissement_responsable_siret_intitule: isValidDummy,
  etablissement_formateur_siret_intitule: isValidDummy,
  etablissement_reference_type: isValidDummy,
  etablissement_reference_conventionne: isValidDummy,
  etablissement_reference_declare_prefecture: isValidDummy,
  etablissement_reference_datadock: isValidDatadock,
  source: isValidDummy,
  diplome: isValidDiplome,
  intitule: isValidIntitule,
  nom_academie_siege: isValidDummy,
  computed_type: isValidDummy,
  computed_conventionne: isValidConventionne,
  computed_declare_prefecture: isValidDummy,
  computed_info_datadock: isValidDummy,
  capital_social: isValidCapital,
  numero_tva_intracommunautaire: isValidTva,
  forme_juridique: isValidDummy,
  forme_juridique_code: isValidDummy,
  ds_questions_nom: isValidDummy,
  raison_sociale: isValidDummy,
  code_effectif_entreprise: isValidDummy,
  date_creation: isValidDateCreation,
  nom: isValidDummy,
  prenom: isValidDummy,
  naf_code: isValidNafCode,
  naf_libelle: isValidDummy,
  adresse: isValidDummy,
  numero_voie: isValidDummy,
  type_voie: isValidDummy,
  nom_voie: isValidDummy,
  complement_adresse: isValidDummy,
  localite: isValidDummy,

  rncp_etablissement_reference_habilite: isValidDummy,
  rncp_eligible_apprentissage: isValidDummy,
  rncp_code: isValidDummy,
  rome_codes: isValidDummy,

  mef_10_code: isValidDummy,
  mef_8_code: isValidDummy,
  mef_8_codes: isValidDummy,
  parcoursup_reference: isValidDummy,
};
