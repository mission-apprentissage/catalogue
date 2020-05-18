const logger = require("../../../../../common-jobs/Logger").mainLogger;
const { Establishment } = require("../../../../../common-jobs/models");

class EstablishmentsData {
  constructor() {}

  async getUpdates(training) {
    const attachedEstablishments = await this.getAttachedEstablishments(training);

    let referenceEstablishment = attachedEstablishments.responsable || attachedEstablishments.formateur;

    // Check etablissement responsable found
    if (!referenceEstablishment) {
      logger.info(
        `No etablissements found for training ${training._id} - siret_CFA_OFA : ${training.etablissement_responsable_siret}`
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
      etablissement_responsable_published: attachedEstablishments.responsable
        ? attachedEstablishments.responsable.published
        : false,
      etablissement_responsable_id: attachedEstablishments.responsable ? attachedEstablishments.responsable._id : null,
      etablissement_responsable_uai: attachedEstablishments.responsable ? attachedEstablishments.responsable.uai : null,
      etablissement_responsable_enseigne: attachedEstablishments.responsable
        ? attachedEstablishments.responsable.enseigne
        : null,

      etablissement_formateur_published: attachedEstablishments.formateur
        ? attachedEstablishments.formateur.published
        : false,
      etablissement_formateur_id: attachedEstablishments.formateur ? attachedEstablishments.formateur._id : null,
      etablissement_formateur_uai: attachedEstablishments.formateur ? attachedEstablishments.formateur.uai : null,
      etablissement_formateur_enseigne: attachedEstablishments.formateur
        ? attachedEstablishments.formateur.enseigne
        : null,

      etablissement_reference,
      etablissement_reference_catalogue_published: referenceEstablishment.catalogue_published,
      etablissement_reference_published: referenceEstablishment.published,
      etablissement_reference_declare_prefecture: referenceEstablishment.computed_declare_prefecture,
      etablissement_reference_type: referenceEstablishment.computed_type,
      etablissement_reference_conventionne: referenceEstablishment.computed_conventionne,
      etablissement_reference_datadock: referenceEstablishment.computed_info_datadock,
    };
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
