const { describe, it } = require("mocha");
const assert = require("assert");
const { getModaliteFromMef10 } = require("./mefHandler");

describe(__filename, () => {
  it("Vérifie que on récupere les modalités BCN d'un code MEF 10", async () => {
    assert.deepStrictEqual(await getModaliteFromMef10("3712101422"), { duree: "2", annee: "2" });
  });
});
