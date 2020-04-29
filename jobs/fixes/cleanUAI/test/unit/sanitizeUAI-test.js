const assert = require("assert");
const sanitizeUAI = require("../../src/services/sanitizeUAI");

describe(__filename, () => {
  it("Doit conserver uniquement le partie UAI valide", () => {
    let uai = sanitizeUAI("Celui du CFA dont on dépend :1111111W");

    assert.strictEqual(uai, "1111111W");
  });

  it("Doit trouver et corriger un UAI en minuscule", () => {
    let uai = sanitizeUAI("1111111w");

    assert.strictEqual(uai, "1111111W");
  });

  it("Doit trouver un UAI séparé par des '-', des '.' ou , des ' '", () => {
    let uai = sanitizeUAI("111-111.1 W");

    assert.strictEqual(uai, "1111111W");
  });

  it("Doit laisser intacte quand il y a plusieurs UAI valides", () => {
    let uai = sanitizeUAI("1111111A - 1111111W");

    assert.strictEqual(uai, "1111111A - 1111111W");
  });

  it("Doit laisser intacte quand il y a pas UAI", () => {
    let uai = sanitizeUAI("2428P001828");

    assert.strictEqual(uai, "2428P001828");
  });

  it("Doit laisser intacte quand il n'y a pas de données", () => {
    let uai = sanitizeUAI("");

    assert.strictEqual(uai, "");
  });
});
