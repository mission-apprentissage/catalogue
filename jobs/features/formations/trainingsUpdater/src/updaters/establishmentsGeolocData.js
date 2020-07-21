const logger = require("../../../../../common-jobs/Logger").mainLogger;
const { Establishment } = require("../../../../../../common/models2");

class EstablishmentGeolocsData {
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

const establishmentGeolocsData = new EstablishmentGeolocsData();
module.exports = establishmentGeolocsData;
