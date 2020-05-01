const assert = require("assert");
const updateEstablishment = require("../../src/services/updateEstablishment");
const { createEstablishment } = require("../../../../test/data/fixtures");
const { Establishment } = require("../../../../common-jobs/models");
const { connectToMongo } = require("../../../../../common/mongo");

let queryForTests = { nom_commercial: "TEST" };

describe(__filename, () => {
  before(() => connectToMongo());

  afterEach(() => {
    return Establishment.deleteMany(queryForTests);
  });

  it("Doit laisser intacte les données sans UAI valide", async () => {
    let establishment = createEstablishment({
      uai: "INVALID",
    });
    await establishment.save();

    await updateEstablishment({ query: queryForTests });

    const results = await Establishment.find(queryForTests);
    assert.strictEqual(results[0].uai, "INVALID");
  });

  it("Doit mettre à jour la property uai", async () => {
    let establishment = createEstablishment({
      uai: "9111111 J",
    });
    await establishment.save();

    await updateEstablishment({ query: queryForTests });

    const results = await Establishment.find(queryForTests);
    assert.strictEqual(results[0].uai, "9111111J");
  });

  it("Doit mettre à jour la property ds_questions_uai", async () => {
    let establishment = createEstablishment({
      ds_questions_uai: "9111111 J",
    });
    await establishment.save();

    await updateEstablishment({ query: queryForTests });

    const results = await Establishment.find(queryForTests);
    assert.strictEqual(results[0].ds_questions_uai, "9111111J");
  });

  it("Doit fournir des statistiques de mise à jour", async () => {
    let establishment = createEstablishment({
      ds_questions_uai: "9111111 J",
    });
    await establishment.save();

    let stats = await updateEstablishment({ query: queryForTests });

    assert.deepStrictEqual(stats, {
      updated: 1,
      total: 1,
      errors: 0,
    });
  });
});
