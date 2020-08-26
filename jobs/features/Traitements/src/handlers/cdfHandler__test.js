const { describe, it } = require("mocha");
const assert = require("assert");
const { getDataFromCfd } = require("./cfdHandler");

describe(__filename, () => {
  it("Vérifie que on récupere les informations BCN d'un code formation diplome 8 Caracteres", async () => {
    assert.deepStrictEqual(await getDataFromCfd("32321014"), {
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
      },
    });
  });

  it("Vérifie que on récupere les détails de la spécialité d'un code formation diplome 9 Caracteres", async () => {
    assert.deepStrictEqual(await getDataFromCfd("32321014T"), {
      result: {
        cfd: "32321014",
        specialite: {
          lettre: "T",
          libelle: "REALISATION DU SERVICE",
          libelle_court: "REALI-SERV",
        },
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
      },
      messages: {
        cfd: "Trouvé",
        specialite: "Ok",
        niveau: "Ok",
        intitule_long: "Ok",
        intitule_court: "Ok",
        diplome: "Ok",
        mefs10: "Ok",
        mefs8: "Ok",
      },
    });
  });

  it("Doit retourner les erreurs avec un code Cfd erroné", async () => {
    assert.deepStrictEqual(await getDataFromCfd("323210X14TW"), {
      result: {},
      messages: {
        error: "Le code formation dilpome doit être définit et au format 8 caractères ou 9 avec la lettre specialité",
      },
    });
  });
});
