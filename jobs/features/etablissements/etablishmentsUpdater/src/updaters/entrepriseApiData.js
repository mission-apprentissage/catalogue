const apiEntreprise = require("../services/apiEntreprise");

class EntrepriseApiData {
  constructor() {}

  async getUpdates(establishment) {
    const result = await this.updateEtablissementsFromEntrepriseApi(establishment);
    return result;
  }

  async updateEtablissementsFromEntrepriseApi(establishment) {
    if (!establishment.siren || establishment.siren === "") {
      return null;
    }

    const etablissementApiInfo = await apiEntreprise.getEntrepriseInfoFromSiren(establishment.siren);
    if (
      !etablissementApiInfo ||
      !etablissementApiInfo.etablissement_siege ||
      !etablissementApiInfo.entreprise ||
      !etablissementApiInfo.entreprise.etat_administratif
    ) {
      return null;
    }

    return {
      numero_tva_intracommunautaire: etablissementApiInfo.entreprise.numero_tva_intracommunautaire,
      naf_code: etablissementApiInfo.entreprise.naf_entreprise,
      naf_libelle: etablissementApiInfo.entreprise.libelle_naf_entreprise,
      code_effectif_entreprise: etablissementApiInfo.entreprise.code_effectif_entreprise,
      forme_juridique_code: etablissementApiInfo.entreprise.forme_juridique_code,
      forme_juridique: etablissementApiInfo.entreprise.forme_juridique,
      raison_sociale: etablissementApiInfo.entreprise.raison_sociale,
      nom_commercial: etablissementApiInfo.entreprise.nom_commercial,
      capital_social: etablissementApiInfo.entreprise.capital_social,
      date_creation: etablissementApiInfo.entreprise.date_creation,
      date_fermeture: etablissementApiInfo.entreprise.etat_administratif.date_fermeture || null,
      ferme: etablissementApiInfo.entreprise.etat_administratif.value === "C",
      siret_siege_social: etablissementApiInfo.entreprise.siret_siege_social,
      siege_social: etablissementApiInfo.etablissement_siege.siege_social,

      adresse:
        etablissementApiInfo.etablissement_siege.adresse.l1 +
        "\r\n" +
        etablissementApiInfo.etablissement_siege.adresse.l2 +
        "\r\n" +
        etablissementApiInfo.etablissement_siege.adresse.l3 +
        "\r\n" +
        etablissementApiInfo.etablissement_siege.adresse.l4,
      complement_adresse: etablissementApiInfo.etablissement_siege.adresse.complement_adresse,
      numero_voie: etablissementApiInfo.etablissement_siege.adresse.numero_voie,
      type_voie: etablissementApiInfo.etablissement_siege.adresse.type_voie,
      nom_voie: etablissementApiInfo.etablissement_siege.adresse.nom_voie,
      code_postal: etablissementApiInfo.etablissement_siege.adresse.code_postal,
      localite: etablissementApiInfo.etablissement_siege.adresse.localite,
      code_insee_localite: etablissementApiInfo.etablissement_siege.adresse.code_insee_localite,

      nom: etablissementApiInfo.entreprise.nom,
      prenom: etablissementApiInfo.entreprise.prenom,
    };
  }
}

const entrepriseApiData = new EntrepriseApiData();
module.exports = entrepriseApiData;
