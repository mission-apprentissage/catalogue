/**
 * Objectif :
 * Si dans le tableau matching_uai ou matching_cfd j'ai un data_length == 1
 *  Alors je retourne les données de la formation et de l'établissement dans un objet
 * Sinon, je cherche le plus petit data_length disponible
 *  Alors je retourne dans un objet la formation puis autant d'objet que d'établissement trouvé à la suite
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
