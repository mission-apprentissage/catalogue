const path = require("path");
const assert = require("assert");
const fs = require("fs");
const importOnisep = require("../../src/importONISEP");
const { createFormation } = require("../../../../test/data/fixtures");
const { Formation } = require("../../../../../common/models");
const { connectToMongo } = require("../../../../../common/mongo");
const { getElasticInstance } = require("../../../../../common/esClient");

const formationQueryForTests = { source: "TEST" };
const getInputStream = fileName => {
  return fs.createReadStream(path.join(__dirname, "..", "data", fileName), { encoding: "UTF-8" });
};

describe(__filename, () => {
  before(() => connectToMongo());

  afterEach(async () => {
    await Formation.deleteMany(formationQueryForTests);
    await getElasticInstance().deleteByQuery({
      index: "formations",
      body: {
        query: {
          match: formationQueryForTests,
        },
      },
    });
  });

  it("Récupère les informations de l'ONISEP pour une formation", async () => {
    let formation = createFormation({
      educ_nat_code: "EDUCNAT1",
      etablissement_formateur_siret: "22222222222222",
      etablissement_responsable_siret: "22222222222222",
      etablissement_reference: "formateur",
    });
    await formation.save();

    await importOnisep(getInputStream("onisep.csv"), {
      query: formationQueryForTests,
    });

    const results = await Formation.find(formationQueryForTests);
    let doc = results[0].toObject();
    assert.strictEqual(doc.onisep_url, "http://www.onisep.fr/http/redirection/formation/identifiant/4251");
  });

  it("Récupère les informations de l'ONISEP pour une formation inconnue", async () => {
    let formation = createFormation({
      educ_nat_code: "UNKNOWN",
      etablissement_formateur_siret: "22222222222222",
      etablissement_responsable_siret: "22222222222222",
      etablissement_reference: "formateur",
    });
    await formation.save();

    await importOnisep(getInputStream("onisep.csv"), {
      query: formationQueryForTests,
    });

    const results = await Formation.find(formationQueryForTests);
    let doc = results[0].toObject();
    assert.strictEqual(doc.onisep_url, null);
  });
});
