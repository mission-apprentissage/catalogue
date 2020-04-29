/**
 * Get mna data formatted for etablissement
 * @param {*} etablissement
 */
const getEtablissementFormattedMnaData = etablissement => {
  return {
    __mna_id: etablissement.id,
    _mna_siret: etablissement.siret,
    _mna_num_academie: etablissement.num_academie,
    _mna_code_insee_localite: etablissement.code_insee_localite,
    _mna_raison_sociale: etablissement.raison_sociale,
    _mna_etablissement_ferme: etablissement.ferme,
  };
};
module.exports.getEtablissementFormattedMnaData = getEtablissementFormattedMnaData;

/**
 * Get mna data formatted for training
 * @param {*} etablissementItem
 */
const getTrainingFormattedMnaData = formation => {
  return {
    __mna_id: formation.id,
    _mna_siret: formation.siret,
    _mna_uai_formation: formation.uai_formation,
    _mna_num_academie: formation.num_academie,
    _mna_nom_academie: formation.nom_academie,
    _mna_code_commune_insee: formation.code_commune_insee,
    _mna_intitule: formation.intitule,
  };
};
module.exports.getTrainingFormattedMnaData = getTrainingFormattedMnaData;
