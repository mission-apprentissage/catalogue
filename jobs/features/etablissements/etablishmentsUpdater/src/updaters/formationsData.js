//const logger = require("../../../../../common-jobs/Logger").mainLogger;
const { Formation } = require("../../../../../common-jobs/models");

class FormationsData {
  constructor() {}

  async getUpdates(establishment) {
    const formationsAsFormateur = await Formation.find({ etablissement_formateur_siret: establishment.siret }).and([
      { uai_formation: { $ne: null } },
      { uai_formation: { $ne: "" } },
    ]);
    const formationsAsResponsable = await Formation.find({ etablissement_responsable_siret: establishment.siret }).and([
      { uai_formation: { $ne: null } },
      { uai_formation: { $ne: "" } },
    ]);

    if (formationsAsFormateur.length === 0 && formationsAsResponsable.length === 0) {
      return {
        formations_attachees: false,
      };
    }

    // // let formations_ids = new Map();
    // // let formations_uais = new Map();
    // let formations_responsable_ids = new Map();
    // let formations_responsable_uais = new Map();
    // let formations_formateur_ids = new Map();
    // let formations_formateur_uais = new Map();

    // formationsAsResponsable.forEach(({ uai_formation, _id }) => {
    //   // formations_ids.set(`${_id}`, _id);
    //   // formations_uais.set(`${uai_formation}`, uai_formation);

    //   formations_responsable_ids.set(`${_id}`, _id);
    //   formations_responsable_uais.set(`${uai_formation}`, uai_formation);
    // });

    // formationsAsFormateur.forEach(({ uai_formation, _id }) => {
    //   // formations_ids.set(`${_id}`, _id);
    //   // formations_uais.set(`${uai_formation}`, uai_formation);

    //   formations_formateur_ids.set(`${_id}`, _id);
    //   formations_formateur_uais.set(`${uai_formation}`, uai_formation);
    // });

    return {
      formations_attachees: true,
      // // formations_ids: Array.from(formations_ids.values()),
      // // formations_uais: Array.from(formations_uais.values()),

      // formations_responsable_ids: Array.from(formations_responsable_ids.values()),
      // formations_responsable_uais: Array.from(formations_responsable_uais.values()),
      // formations_formateur_ids: Array.from(formations_formateur_ids.values()),
      // formations_formateur_uais: Array.from(formations_formateur_uais.values()),
    };
  }
}

const formationsData = new FormationsData();
module.exports = formationsData;
