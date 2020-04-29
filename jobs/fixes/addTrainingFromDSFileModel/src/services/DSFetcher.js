const axios = require("axios");
//const log = require("../../../../common/Logger");

const formFieldToDsId = {
  nom: "922865", // Nom du correspondant désigné par l'établissement
  email: "922867", // Courriel du correspondant
  hasUai: "947502", // L'établissement est-il déjà doté d'un numéro UAI ?
  uai: "947501", // Si oui merci de le renseigner ici.
  hasDeclarationCode: "925845", // Numéro de déclaration d'activité
  declarationCode: "922869", // Si oui, merci de le renseigner ici.
  hasAgrementCFA: "922871", // Agrément / Conventionnement par le conseil régional en tant que CFA ?
  hasCertificaton2015: "922966", // Certification pour la qualité des actions de formation
  hasAskForCertificaton: "944807", // Avez-vous engagé une démarche de certification qualité au titre des actions de formation en apprentissage ?
  AskForCertificatonDate: "923190", // Si oui, indiquez la date de demande de certification.
  has2020Training: "941258", // Votre établissement proposera-t-il au moins une formation en 2020 ?
  catalogue: "923193", // Catalogue de formations dispensées par apprentissage
  linkedCatalogue: "927285", // Fichier de catalogue de formations dispensées par apprentissage
};

class DSFetcher {
  constructor() {
    this.token = "HaE6n4hc43MnmGpP96ir51CY";
    this.procedureId = 23783;
    //log.mainLogger().info(`DS API Config : Procédure = ${this.procedureId}, Token = ${this.token}`);
  }

  buildHeaders() {
    return {
      headers: {
        Authorization: `Bearer token=${this.token}`,
      },
    };
  }

  async getProcedure() {
    try {
      //log.mainLogger().info("DS Fetching API - getProcedure");
      const response = await axios.get(`https://www.demarches-simplifiees.fr/api/v1/procedures/${this.procedureId}`, {
        ...this.buildHeaders(),
      });
      return response.data;
    } catch (error) {
      //log.mainLogger().error(error);
    }
  }

  async getDossiers(page = 1, tousLesDossiers = []) {
    try {
      //log.mainLogger().info(`DS Fetching API - getDossiers - page=${page}`);
      const response = await axios.get(
        `https://www.demarches-simplifiees.fr/api/v1/procedures/${this.procedureId}/dossiers`,
        {
          ...this.buildHeaders(),
          params: {
            resultats_par_page: 1000,
            page,
          },
        }
      );
      const { dossiers, pagination } = response.data;

      tousLesDossiers = tousLesDossiers.concat(dossiers);

      if (page < pagination.nombre_de_page) {
        return this.getDossiers(page + 1, tousLesDossiers);
      } else {
        return tousLesDossiers;
      }
    } catch (error) {
      //log.mainLogger().error(error);
    }
  }

  async getDossier(dossierId) {
    try {
      const response = await axios.get(
        `https://www.demarches-simplifiees.fr/api/v1/procedures/${this.procedureId}/dossiers/${dossierId}`,
        {
          ...this.buildHeaders(),
        }
      );
      return response.data;
    } catch (error) {
      if (error.response) {
        //log.mainLogger().error(error.message);
      }
      return { dossier: null };
    }
  }

  async getEtablishment(dossierId) {
    const { dossier } = await this.getDossier(dossierId);
    return {
      id: dossierId,
      ...dossier.entreprise,
      ...dossier.etablissement,
      ...this.getQuestions(dossier),
    };
  }

  getQuestions(dossier) {
    const champs = this.rewireChamps(dossier.champs);
    return {
      ds_questions_nom: champs[formFieldToDsId.nom].value,
      ds_questions_email: champs[formFieldToDsId.email].value,
      ds_questions_uai: champs[formFieldToDsId.uai].value,
      uai: champs[formFieldToDsId.uai].value,
      ds_questions_declarationCode: champs[formFieldToDsId.declarationCode].value,
      ds_questions_hasAgrementCFA: champs[formFieldToDsId.hasAgrementCFA].value,
      ds_questions_hasCertificaton2015: champs[formFieldToDsId.hasCertificaton2015].value,
      ds_questions_hasAskForCertificaton: champs[formFieldToDsId.hasAskForCertificaton].value,
      ds_questions_askForCertificatonDate: champs[formFieldToDsId.AskForCertificatonDate].value,
      ds_questions_has2020Training: champs[formFieldToDsId.has2020Training].value,
    };
  }

  rewireChamps(champs) {
    let formatedField = {};
    champs.map(champ => {
      formatedField[champ.type_de_champ.id] = {
        ...champ,
      };
    });
    return formatedField;
  }
}

const dsFetcher = new DSFetcher();
module.exports = dsFetcher;
