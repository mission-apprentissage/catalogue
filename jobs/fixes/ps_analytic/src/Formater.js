/**
 * Objectif :
 * Si dans le tableau matching_uai ou matching_cfd j'ai un data_length == 1
 *  Alors je retourne les données de la formation et de l'établissement dans un objet
 * Sinon, je cherche le plus petit data_length disponible
 *  Alors je retourne dans un objet la formation puis autant d'objet que d'établissement trouvé à la suite
 */

/**
  * Exemple de la strucutre à retourner :
  * {
       ...données formation
       identifiant unique de la formation
      data.MNA_STATUS = options.status;
      data.MNA_MATCHING_TYPE = options.type;
      data.MNA_MATCHING_STEP = options.step;
      data.MNA_MATCHING_CASE = options.match;
      data.etablissement_nom = result.etablissement_responsable_enseigne;
      data.etablissement_raison_social = result.etablissement_responsable_entreprise_raison_sociale;
      data.etablissement_adresse_postal = result.etablissement_responsable_adresse;
      data.etablissement_responsable_code_postal = result.etablissement_responsable_code_postal;
      data.etablissement_responsable_localite = result.etablissement_responsable_localite;
      data.code_commune_insee = result.code_commune_insee;
      data.etablissement_responsable_siret = result.etablissement_responsable_siret;
      data.etablissement_geoloc = result.geo_coordonnees_etablissement_responsable;
      data.etablissement_responsable_uai = result.etablissement_responsable_uai;
      data.etablissement_formateur_uai = result.etablissement_formateur_uai;
      data.uai_formation = result.uai_formation;
  * }
  */

function format(data) {
  if (data.matching_uai[0].data_length === 0) {
    // process CFD
    for (let i = 0; i < data.matching_cfd.data_length; i++) {}

    console.log("coucou cfd");
  } else {
    // process UAI
    console.log("coucou uai");
  }
}
module.exports = format;
