//const logger = require("../../../../../common-jobs/Logger").mainLogger;
const { Formation } = require("../../../../../common-jobs/models");

const niveaux = [
  "3 (CAP...)",
  "4 (Bac...)",
  "5 (BTS, DUT...)",
  "6 (Licence...)",
  "7 (Master, titre ingénieur...)",
  "8 (Doctorat...)",
];

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

    let formations_ids = new Map();
    let formations_uais = new Map();
    let formations_n3 = false;
    let formations_n4 = false;
    let formations_n5 = false;
    let formations_n6 = false;
    let formations_n7 = false;
    // let formations_responsable_ids = new Map();
    // let formations_responsable_uais = new Map();
    // let formations_formateur_ids = new Map();
    // let formations_formateur_uais = new Map();

    formationsAsResponsable.forEach(({ uai_formation, _id, niveau }) => {
      formations_ids.set(`${_id}`, _id);
      formations_uais.set(`${uai_formation}`, uai_formation);

      if (!formations_n3 && niveau === niveaux[0]) formations_n3 = true;
      if (!formations_n4 && niveau === niveaux[1]) formations_n4 = true;
      if (!formations_n5 && niveau === niveaux[2]) formations_n5 = true;
      if (!formations_n6 && niveau === niveaux[3]) formations_n6 = true;
      if (!formations_n7 && niveau === niveaux[4]) formations_n7 = true;

      // formations_responsable_ids.set(`${_id}`, _id);
      // formations_responsable_uais.set(`${uai_formation}`, uai_formation);
    });

    formationsAsFormateur.forEach(({ uai_formation, _id, niveau }) => {
      formations_ids.set(`${_id}`, _id);
      formations_uais.set(`${uai_formation}`, uai_formation);

      if (!formations_n3 && niveau === niveaux[0]) formations_n3 = true;
      if (!formations_n4 && niveau === niveaux[1]) formations_n4 = true;
      if (!formations_n5 && niveau === niveaux[2]) formations_n5 = true;
      if (!formations_n6 && niveau === niveaux[3]) formations_n6 = true;
      if (!formations_n7 && niveau === niveaux[4]) formations_n7 = true;

      // formations_formateur_ids.set(`${_id}`, _id);
      // formations_formateur_uais.set(`${uai_formation}`, uai_formation);
    });

    return {
      formations_attachees: true,
      formations_ids: Array.from(formations_ids.values()),
      formations_uais: Array.from(formations_uais.values()),
      formations_n3,
      formations_n4,
      formations_n5,
      formations_n6,
      formations_n7,

      // formations_responsable_ids: Array.from(formations_responsable_ids.values()),
      // formations_responsable_uais: Array.from(formations_responsable_uais.values()),
      // formations_formateur_ids: Array.from(formations_formateur_ids.values()),
      // formations_formateur_uais: Array.from(formations_formateur_uais.values()),
    };
  }
}

const formationsData = new FormationsData();
module.exports = formationsData;
