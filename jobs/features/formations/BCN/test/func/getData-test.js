const { describe, it } = require("mocha");
const assert = require("assert");
const { run } = require("../../src/");

describe(__filename, () => {
  it("Vérifie que on récupere les informations BCN d'un code formation diplome", async () => {
    assert.deepStrictEqual(
      await run({
        mode: "cfd_info",
        value: "32321014",
      }),
      {
        result: {
          cfd: "32321014",
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
          niveau: "Ok",
          intitule_long: "Ok",
          intitule_court: "Ok",
          diplome: "Ok",
          mefs10: "Ok",
          mefs8: "Ok",
        },
      }
    );
  });

  it("Vérifie que on récupere les modalités BCN d'un code MEF 10", async () => {
    assert.deepStrictEqual(
      await run({
        mode: "mef_modalite",
        value: "3712101422",
      }),
      { duree: "2", annee: "2" }
    );
  });

  it("Vérifie que on récupere les détails de la spécialité d'une lettrede Spécialité", async () => {
    assert.deepStrictEqual(
      await run({
        mode: "cfd_speciality",
        value: "T",
      }),
      {
        lettre: "T",
        libelle: "REALISATION DU SERVICE",
        libelle_court: "REALI-SERV",
      }
    );
  });
});
