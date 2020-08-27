const { describe, it } = require("mocha");
const assert = require("assert");
const { getDataFromRncp } = require("./rncpHandler");

const fixtureSuccess = {
  result: {
    cfd: "32321014",
    specialite: null,
    niveau: "5 (BTS, DUT...)",
    intitule_long: "ANALYSE, CONDUITE ET STRATEGIE DE L'ENTREPRISE AGRICOLE (ACSE) (BTSA)",
    intitule_court: "ANALYSE CDTE STRAT ENTREP AG ACSE",
    diplome: "BREVET DE TECHNICIEN SUPERIEUR AGRICOLE",
    mefs10: [
      { mef10: "3712101422", modalite: { duree: "2", annee: "2" } },
      { mef10: "3712101421", modalite: { duree: "2", annee: "1" } },
      { mef10: "3702101411", modalite: { duree: "1", annee: "1" } },
    ],
    mefs8: ["37121014", "37121014", "37021014"],
    code_rncp: "RNCP24440",
  },
  messages: {
    cfd: "Trouvé",
    specialite: "Non fourni",
    niveau: "Ok",
    intitule_long: "Ok",
    intitule_court: "Ok",
    diplome: "Ok",
    mefs10: "Ok",
    mefs8: "Ok",
    code_rncp: "Ok",
  },
};

describe(__filename, () => {
  it("Doit retourner les informations d'un RNCP 9 Caracteres", async () => {
    assert.deepStrictEqual(await getDataFromRncp("RNCP24440"), { ...fixtureSuccess });
  });

  it("Doit retourner les informations d'un RNCP 5 Caracteres", async () => {
    assert.deepStrictEqual(await getDataFromRncp("24440"), { ...fixtureSuccess });
  });

  it("Doit retourner errueur de format RNCP ", async () => {
    assert.deepStrictEqual(await getDataFromRncp("R24440"), {
      result: {},
      messages: {
        error: "Le code RNCP doit être définit et au format 5 ou 9 caractères,  RNCP24440 ou 24440",
      },
    });
  });

  it("Doit retourner erreure d'un RNCP non trouvé ", async () => {
    assert.deepStrictEqual(await getDataFromRncp("RNCP29940"), {
      result: {
        cfd: null,
        code_rncp: "RNCP29940",
      },
      messages: {
        cfd: "Non trouvé",
        error: "Le code formation dilpome doit être définit et au format 8 caractères ou 9 avec la lettre specialité",
        code_rncp: "Non trouvé",
      },
    });
  });
});
