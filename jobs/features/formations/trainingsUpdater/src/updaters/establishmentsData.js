const logger = require("../../../../../common-jobs/Logger").mainLogger;
const { Establishment } = require("../../../../../../common/models2");

class EstablishmentsData {
  constructor() {}

  async getUpdates(training) {
    const attachedEstablishments = await this.getAttachedEstablishments(training);

    let referenceEstablishment = attachedEstablishments.responsable || attachedEstablishments.formateur;

    // Check etablissement responsable found
    if (!referenceEstablishment) {
      logger.info(
        `No etablissements found for training ${training._id} - siret responsable : ${training.etablissement_responsable_siret}`
      );
      return null;
    }

    let etablissement_reference =
      attachedEstablishments.responsable && referenceEstablishment._id === attachedEstablishments.responsable._id
        ? "responsable"
        : "formateur";

    // Check if etablissement responsable is conventionne if not take etablissement formateur
    if (
      attachedEstablishments.formateur &&
      attachedEstablishments.responsable &&
      attachedEstablishments.responsable.computed_conventionne !== "OUI" &&
      attachedEstablishments.formateur.computed_conventionne === "OUI"
    ) {
      referenceEstablishment = attachedEstablishments.formateur;
      etablissement_reference = "formateur";
    }

    return {
      entreprise_raison_sociale: referenceEstablishment.entreprise_raison_sociale,
      //////////////////////
      etablissement_responsable_published: attachedEstablishments.responsable
        ? attachedEstablishments.responsable.published
        : false,
      etablissement_responsable_id: attachedEstablishments.responsable ? attachedEstablishments.responsable._id : null,
      etablissement_responsable_uai: attachedEstablishments.responsable ? attachedEstablishments.responsable.uai : null,
      etablissement_responsable_enseigne: attachedEstablishments.responsable
        ? attachedEstablishments.responsable.enseigne
        : null,
      etablissement_responsable_type: attachedEstablishments.responsable
        ? attachedEstablishments.responsable.computed_type
        : null,
      etablissement_responsable_conventionne: attachedEstablishments.responsable
        ? attachedEstablishments.responsable.computed_conventionne
        : null,
      etablissement_responsable_declare_prefecture: attachedEstablishments.responsable
        ? attachedEstablishments.responsable.computed_declare_prefecture
        : null,
      etablissement_responsable_datadock: attachedEstablishments.responsable
        ? attachedEstablishments.responsable.computed_info_datadock
        : null,
      //////////////////////
      etablissement_formateur_published: attachedEstablishments.formateur
        ? attachedEstablishments.formateur.published
        : false,
      etablissement_formateur_id: attachedEstablishments.formateur ? attachedEstablishments.formateur._id : null,
      etablissement_formateur_uai: attachedEstablishments.formateur ? attachedEstablishments.formateur.uai : null,
      etablissement_formateur_enseigne: attachedEstablishments.formateur
        ? attachedEstablishments.formateur.enseigne
        : null,
      etablissement_formateur_type: attachedEstablishments.formateur
        ? attachedEstablishments.formateur.computed_type
        : null,
      etablissement_formateur_conventionne: attachedEstablishments.formateur
        ? attachedEstablishments.formateur.computed_conventionne
        : null,
      etablissement_formateur_declare_prefecture: attachedEstablishments.formateur
        ? attachedEstablishments.formateur.computed_declare_prefecture
        : null,
      etablissement_formateur_datadock: attachedEstablishments.formateur
        ? attachedEstablishments.formateur.computed_info_datadock
        : null,
      //////////////////////
      etablissement_reference,
      etablissement_reference_catalogue_published: referenceEstablishment.catalogue_published,
      etablissement_reference_published: referenceEstablishment.published,
      etablissement_reference_declare_prefecture: referenceEstablishment.computed_declare_prefecture,
      etablissement_reference_type: referenceEstablishment.computed_type,
      etablissement_reference_conventionne: referenceEstablishment.computed_conventionne,
      etablissement_reference_datadock: referenceEstablishment.computed_info_datadock,

      geo_coordonnees_etablissement_reference: referenceEstablishment.geo_coordonnees,
      geo_coordonnees_etablissement_formateur: attachedEstablishments.formateur
        ? attachedEstablishments.formateur.geo_coordonnees
        : null,
      geo_coordonnees_etablissement_responsable: attachedEstablishments.responsable
        ? attachedEstablishments.responsable.geo_coordonnees
        : null,
      idea_geo_coordonnees_etablissement: attachedEstablishments.formateur
        ? attachedEstablishments.formateur.geo_coordonnees
        : attachedEstablishments.responsable.geo_coordonnees,

      etablissement_formateur_adresse: this.getEstablishmentAddress(attachedEstablishments.formateur),
      etablissement_formateur_code_postal: attachedEstablishments.formateur
        ? attachedEstablishments.formateur.code_postal
        : null,
      etablissement_formateur_localite: attachedEstablishments.formateur
        ? attachedEstablishments.formateur.localite
        : null,
      etablissement_formateur_complement_adresse: attachedEstablishments.formateur
        ? attachedEstablishments.formateur.complement_adresse
        : null,
      etablissement_formateur_cedex: attachedEstablishments.formateur ? attachedEstablishments.formateur.cedex : null,
      etablissement_formateur_entreprise_raison_sociale: attachedEstablishments.formateur
        ? attachedEstablishments.formateur.entreprise_raison_sociale
        : null,

      etablissement_responsable_adresse: this.getEstablishmentAddress(attachedEstablishments.responsable),
      etablissement_responsable_code_postal: attachedEstablishments.responsable
        ? attachedEstablishments.responsable.code_postal
        : null,
      etablissement_responsable_localite: attachedEstablishments.responsable
        ? attachedEstablishments.responsable.localite
        : null,
      etablissement_responsable_complement_adresse: attachedEstablishments.responsable
        ? attachedEstablishments.responsable.complement_adresse
        : null,
      etablissement_responsable_cedex: attachedEstablishments.responsable
        ? attachedEstablishments.responsable.cedex
        : null,
      etablissement_responsable_entreprise_raison_sociale: attachedEstablishments.responsable
        ? attachedEstablishments.responsable.entreprise_raison_sociale
        : null,

      etablissement_reference_adresse: this.getEstablishmentAddress(referenceEstablishment),
      etablissement_reference_code_postal: referenceEstablishment ? referenceEstablishment.code_postal : null,
      etablissement_reference_localite: referenceEstablishment ? referenceEstablishment.localite : null,
      etablissement_reference_complement_adresse: referenceEstablishment
        ? referenceEstablishment.complement_adresse
        : null,
      etablissement_reference_cedex: referenceEstablishment ? referenceEstablishment.cedex : null,
    };
  }

  getEstablishmentAddress(establishment) {
    return establishment
      ? `${establishment.numero_voie ? establishment.numero_voie : ""} ${
          establishment.type_voie ? establishment.type_voie : ""
        } ${establishment.nom_voie ? establishment.nom_voie : ""}`
      : null;
  }

  async getAttachedEstablishments(training) {
    // Find establishment Responsable
    const responsable = await Establishment.findOne({
      siret: training.etablissement_responsable_siret,
    });

    // Find establishment Formateur
    const formateur = await Establishment.findOne({
      siret: training.etablissement_formateur_siret,
    });

    return {
      responsable,
      formateur,
    };
  }
}

const establishmentsData = new EstablishmentsData();
module.exports = establishmentsData;
