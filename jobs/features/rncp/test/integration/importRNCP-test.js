const assert = require("assert");
const fs = require("fs");
const path = require("path");
const importRNCP = require("../../src/importRNCP");
const { createFormation } = require("../../../../test/data/fixtures");
const { Formation } = require("../../../../../common/models");
const { connectToMongo } = require("../../../../../common/mongo");
const { getElasticInstance } = require("../../../../../common/esClient");

let formationQueryForTests = { source: "TEST" };
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

  it("Récupère les informations RNCP pour une formation", async () => {
    let formation = createFormation({
      educ_nat_code: "EDUCNAT1",
      etablissement_formateur_siret: "11111111111111",
      etablissement_responsable_siret: "11111111111111",
      etablissement_reference: "formateur",
    });
    await formation.save();

    await importRNCP(getInputStream("rncp.xml"), getInputStream("rncp-mapping.csv"), {
      query: formationQueryForTests,
    });

    const results = await Formation.find(formationQueryForTests);
    let doc = results[0].toObject();
    assert.strictEqual(doc.rncp_code, "RNCPXXXX1");
    assert.strictEqual(doc.rncp_intitule, "MASTER");
    assert.deepStrictEqual(doc.rome_codes, ["I1607", "D1211"]);
    assert.strictEqual(doc.rncp_eligible_apprentissage, true);
    assert.strictEqual(doc.rncp_etablissement_formateur_habilite, true);
    assert.strictEqual(doc.rncp_etablissement_responsable_habilite, true);
    assert.strictEqual(doc.rncp_etablissement_reference_habilite, true);
  });

  it("Récupère les informations RNCP d'une formation ayant un organisme formateur non habilité", async () => {
    let formation = createFormation({
      educ_nat_code: "EDUCNAT1",
      etablissement_formateur_siret: "33333333333333",
      etablissement_responsable_siret: "11111111111111",
      etablissement_reference: "formateur",
    });
    await formation.save();

    await importRNCP(getInputStream("rncp.xml"), getInputStream("rncp-mapping.csv"), {
      query: formationQueryForTests,
    });

    const results = await Formation.find(formationQueryForTests);
    assert.strictEqual(results[0].rncp_etablissement_formateur_habilite, false);
    assert.strictEqual(results[0].rncp_etablissement_responsable_habilite, true);
    assert.strictEqual(results[0].rncp_etablissement_reference_habilite, false);
  });

  it("Récupère les informations RNCP d'une formation ayant un organisme responsable non habilité", async () => {
    let formation = createFormation({
      educ_nat_code: "EDUCNAT1",
      etablissement_formateur_siret: "11111111111111",
      etablissement_responsable_siret: "33333333333333",
      etablissement_reference: "responsable",
    });
    await formation.save();

    await importRNCP(getInputStream("rncp.xml"), getInputStream("rncp-mapping.csv"), {
      query: formationQueryForTests,
    });

    const results = await Formation.find(formationQueryForTests);
    assert.strictEqual(results[0].rncp_etablissement_formateur_habilite, true);
    assert.strictEqual(results[0].rncp_etablissement_responsable_habilite, false);
    assert.strictEqual(results[0].rncp_etablissement_reference_habilite, false);
  });

  it("Récupère les informations RNCP d'une formation inconnue", async () => {
    let formation = createFormation({
      educ_nat_code: "UNKNOWN",
      etablissement_formateur_siret: "11111111111111",
      etablissement_responsable_siret: "33333333333333",
      etablissement_reference: "responsable",
    });
    await formation.save();

    await importRNCP(getInputStream("rncp.xml"), getInputStream("rncp-mapping.csv"), {
      query: formationQueryForTests,
    });

    const results = await Formation.find(formationQueryForTests);
    let doc = results[0].toObject();
    assert.strictEqual(doc.rncp_code, null);
    assert.deepStrictEqual(doc.rome_codes, []);
    assert.strictEqual(doc.rncp_eligible_apprentissage, false);
    assert.strictEqual(doc.rncp_etablissement_formateur_habilite, false);
    assert.strictEqual(doc.rncp_etablissement_responsable_habilite, false);
    assert.strictEqual(doc.rncp_etablissement_reference_habilite, false);
  });

  it("Permet d'obtenir des stats d'import et de mises à jour des formations", async () => {
    let formation = createFormation({
      educ_nat_code: "EDUCNAT1",
      etablissement_formateur_siret: "11111111111111",
      etablissement_responsable_siret: "11111111111111",
    });
    await formation.save();

    let stats = await importRNCP(getInputStream("rncp.xml"), getInputStream("rncp-mapping.csv"), {
      query: formationQueryForTests,
    });

    assert.deepStrictEqual(stats, {
      formations: { updated: 1, errors: 0 },
      referentiel: { errors: 0, total: 1 },
    });
  });
});
