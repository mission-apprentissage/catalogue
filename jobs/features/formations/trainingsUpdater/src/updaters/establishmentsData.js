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
    // Check if etablissement responsable is conventionne if not take etablissement formateur
    if (
      attachedEstablishments.formateur &&
      attachedEstablishments.responsable &&
      attachedEstablishments.responsable.computed_conventionne !== "OUI" &&
      attachedEstablishments.formateur.computed_conventionne === "OUI"
    ) {
      referenceEstablishment = attachedEstablishments.formateur;
    }

    return {
      etablissement_responsable_id: attachedEstablishments.responsable ? attachedEstablishments.responsable._id : null,
      etablissement_formateur_id: attachedEstablishments.formateur ? attachedEstablishments.formateur._id : null,
      etablissement_responsable_uai: attachedEstablishments.responsable ? attachedEstablishments.responsable.uai : null,
      etablissement_formateur_uai: attachedEstablishments.formateur ? attachedEstablishments.formateur.uai : null,
      etablissement_reference_declare_prefecture: referenceEstablishment.computed_declare_prefecture,
      etablissement_reference_type: referenceEstablishment.computed_type,
      etablissement_reference_conventionne: referenceEstablishment.computed_conventionne,
      etablissement_reference_datadock: referenceEstablishment.computed_info_datadock,
      etablissement_reference_published: referenceEstablishment.published, // || referenceEstablishment.api_entreprise_reference, TODO Published Rules
      // published: referenceEstablishment.api_entreprise_reference,
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
