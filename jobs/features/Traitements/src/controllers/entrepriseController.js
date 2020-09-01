const apiEntreprise = require("../common/apiEntreprise");

class EntrepriseApiData {
  constructor() {}

  async findDataFromSiret(providedSiret) {
    if (!providedSiret || !/^[0-9]{14}$/g.test(providedSiret.trim())) {
      return {
        result: {},
        messages: {
          error: "Le Siret doit être définit et au format 14 caractères",
        },
      };
    }

    let siret = `${providedSiret}`.trim();

    const responseEstablishmentApiInfo = await apiEntreprise.getEntrepriseInfoFromSiret(siret);
    if (!responseEstablishmentApiInfo) {
      return {
        result: {},
        messages: {
          error: "Siret non trouvé",
        },
      };
    }

    const siren = siret.substring(0, 9);
    const responseEntrepriseApiInfo = await apiEntreprise.getEntrepriseInfoFromSiren(siren);

    if (!responseEntrepriseApiInfo) {
      return {
        result: {},
        messages: {
          error: "Siren non trouvé",
        },
      };
    }

    const { entreprise: entrepriseApiInfo } = responseEntrepriseApiInfo;

    const { etablissement: etablissementApiInfo } = responseEstablishmentApiInfo;

    return {
      result: {
        siege_social: etablissementApiInfo.siege_social,
        etablissement_siege_siret: entrepriseApiInfo.siret_siege_social,
        siret: etablissementApiInfo.siret,
        siren,
        naf_code: etablissementApiInfo.naf,
        naf_libelle: etablissementApiInfo.libelle_naf,
        tranche_effectif_salarie: etablissementApiInfo.tranche_effectif_salarie_etablissement,
        date_creation: etablissementApiInfo.date_creation_etablissement,
        date_mise_a_jour: etablissementApiInfo.date_mise_a_jour,
        diffusable_commercialement: etablissementApiInfo.diffusable_commercialement,
        enseigne: etablissementApiInfo.enseigne ? etablissementApiInfo.enseigne : entrepriseApiInfo.enseigne,

        adresse: this.buildAdresse(etablissementApiInfo.adresse),
        numero_voie: etablissementApiInfo.adresse.numero_voie,
        type_voie: etablissementApiInfo.adresse.type_voie,
        nom_voie: etablissementApiInfo.adresse.nom_voie,
        complement_adresse: etablissementApiInfo.adresse.complement_adresse,
        code_postal: etablissementApiInfo.adresse.code_postal,
        num_departement: etablissementApiInfo.adresse.code_postal.substring(0, 2),
        localite: etablissementApiInfo.adresse.localite,
        code_insee_localite: etablissementApiInfo.adresse.code_insee_localite,
        cedex: etablissementApiInfo.adresse.cedex,

        date_fermeture: etablissementApiInfo.etat_administratif.date_fermeture,
        ferme: etablissementApiInfo.etat_administratif.value === "C",

        region_implantation_code: etablissementApiInfo.region_implantation.code,
        region_implantation_nom: etablissementApiInfo.region_implantation.value,
        commune_implantation_code: etablissementApiInfo.commune_implantation.code,
        commune_implantation_nom: etablissementApiInfo.commune_implantation.value,
        pays_implantation_code: etablissementApiInfo.pays_implantation.code,
        pays_implantation_nom: etablissementApiInfo.pays_implantation.value,

        entreprise_siren: entrepriseApiInfo.siren,
        entreprise_procedure_collective: entrepriseApiInfo.procedure_collective,
        entreprise_enseigne: entrepriseApiInfo.enseigne,
        entreprise_numero_tva_intracommunautaire: entrepriseApiInfo.numero_tva_intracommunautaire,
        entreprise_code_effectif_entreprise: entrepriseApiInfo.code_effectif_entreprise,
        entreprise_forme_juridique_code: entrepriseApiInfo.forme_juridique_code,
        entreprise_forme_juridique: entrepriseApiInfo.forme_juridique,
        entreprise_raison_sociale: entrepriseApiInfo.raison_sociale,
        entreprise_nom_commercial: entrepriseApiInfo.nom_commercial,
        entreprise_capital_social: entrepriseApiInfo.capital_social,
        entreprise_date_creation: entrepriseApiInfo.date_creation,
        entreprise_date_radiation: entrepriseApiInfo.date_radiation,
        entreprise_naf_code: entrepriseApiInfo.naf_entreprise,
        entreprise_naf_libelle: entrepriseApiInfo.libelle_naf_entreprise,
        entreprise_date_fermeture: entrepriseApiInfo.etat_administratif.date_cessation,
        entreprise_ferme: entrepriseApiInfo.etat_administratif.value === "C",
        entreprise_siret_siege_social: entrepriseApiInfo.siret_siege_social,
        entreprise_nom: entrepriseApiInfo.nom,
        entreprise_prenom: entrepriseApiInfo.prenom,
        entreprise_categorie: entrepriseApiInfo.categorie_entreprise,
        entreprise_tranche_effectif_salarie: entrepriseApiInfo.tranche_effectif_salarie_entreprise,

        api_entreprise_reference: true,
      },
      messages: {
        api_entreprise: "Ok",
      },
    };
  }

  buildAdresse(adresse) {
    const l1 = adresse.l1 && adresse.l1 !== "" ? `${adresse.l1}\r\n` : "";
    const l2 = adresse.l2 && adresse.l2 !== "" ? `${adresse.l2}\r\n` : "";
    const l3 = adresse.l3 && adresse.l3 !== "" ? `${adresse.l3}\r\n` : "";
    const l4 = adresse.l4 && adresse.l4 !== "" ? `${adresse.l4}\r\n` : "";
    const l5 = adresse.l5 && adresse.l5 !== "" ? `${adresse.l5}\r\n` : "";
    const l6 = adresse.l6 && adresse.l6 !== "" ? `${adresse.l6}\r\n` : "";
    const l7 = adresse.l7 && adresse.l7 !== "" ? `${adresse.l7}` : "";
    return `${l1}${l2}${l3}${l4}${l5}${l6}${l7}`;
  }
}

const entrepriseApiData = new EntrepriseApiData();
module.exports = entrepriseApiData;
