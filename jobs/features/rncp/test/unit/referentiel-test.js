const assert = require("assert");
const referentiel = require("../../src/rncp/referentiel");
const getTestFile = require("../data/getTestFile");

describe(__filename, () => {
  it("Vérifie qu'un codeEducNat peut-être transcodé en code RNCP", async () => {
    let { buildReferentiel, findRNCP } = referentiel(getTestFile("rncp.xml"), getTestFile("rncp-mapping.csv"));

    await buildReferentiel();

    assert.strictEqual(findRNCP("EDUCNAT1").getCode(), "RNCPXXXX1");
    assert.strictEqual(findRNCP("UNKNOWN").getCode(), null);
  });

  it("Vérifie qu'on peut obtenir le libelle d'une fiche RNCP", async () => {
    let { buildReferentiel, findRNCP } = referentiel(getTestFile("rncp.xml"), getTestFile("rncp-mapping.csv"));

    await buildReferentiel();

    assert.strictEqual(findRNCP("EDUCNAT1").getLibelle(), "MASTER");
    assert.strictEqual(findRNCP("UNKNOWN").getLibelle(), null);
  });

  it("Vérifie l'habilitation d'un organisme partenaire avec habilitation à former", async () => {
    let { buildReferentiel, findRNCP } = referentiel(getTestFile("rncp.xml"), getTestFile("rncp-mapping.csv"));

    await buildReferentiel();
    let rncp = findRNCP("EDUCNAT1");

    assert.strictEqual(rncp.isHabilite("22222222222222"), true);
    assert.strictEqual(rncp.isHabilite("22222222211111"), true);
  });

  it("Vérifie l'habilitation d'un organisme partenaire sans habilitation à former", async () => {
    let { buildReferentiel, findRNCP } = referentiel(getTestFile("rncp.xml"), getTestFile("rncp-mapping.csv"));

    await buildReferentiel();

    assert.strictEqual(findRNCP("EDUCNAT1").isHabilite("22222222200000"), false);
  });

  it("Vérifie l'habilitation d'un organisme certificateur", async () => {
    let { buildReferentiel, findRNCP } = referentiel(getTestFile("rncp.xml"), getTestFile("rncp-mapping.csv"));

    await buildReferentiel();

    assert.strictEqual(findRNCP("EDUCNAT1").isHabilite("11111111111111"), true);
  });

  it("Vérifie l'habilitation d'un organisme inconnu", async () => {
    let { buildReferentiel, findRNCP } = referentiel(getTestFile("rncp.xml"), getTestFile("rncp-mapping.csv"));

    await buildReferentiel();

    assert.strictEqual(findRNCP("EDUCNAT1").isHabilite("UNKNOWN"), false);
  });

  it("Vérifie qu'une fiche est eligible s'elle est en enregistrement de droit", async () => {
    let { buildReferentiel, findRNCP } = referentiel(getTestFile("rncp.xml"), getTestFile("rncp-mapping.csv"));

    await buildReferentiel();

    assert.strictEqual(findRNCP("EDUCNAT1").isEligibleApprentissage(), true);
  });

  it("Vérifie qu'une fiche est eligible s'elle est en enregistrement sur demande et jury CA", async () => {
    let { buildReferentiel, findRNCP } = referentiel(
      getTestFile("rncp-enregistrement-sur-demande-et-jury.xml"),
      getTestFile("rncp-mapping.csv")
    );

    await buildReferentiel();

    assert.strictEqual(findRNCP("EDUCNAT1").isEligibleApprentissage(), true);
  });

  it("Vérifie qu'une fiche est eligible si elle est en enregistrement sur demande mais sans jury CA", async () => {
    let { buildReferentiel, findRNCP } = referentiel(
      getTestFile("rncp-enregistrement-sur-demande.xml"),
      getTestFile("rncp-mapping.csv")
    );

    await buildReferentiel();

    assert.strictEqual(findRNCP("EDUCNAT1").isEligibleApprentissage(), false);
  });

  it("Vérifie qu'une fiche n'est pas eligible si elle est inconnue", async () => {
    let { buildReferentiel, findRNCP } = referentiel(getTestFile("rncp.xml"), getTestFile("rncp-mapping.csv"));

    await buildReferentiel();

    assert.strictEqual(findRNCP("UNKNOWN").isEligibleApprentissage(), false);
  });

  it("Permet d'obtenir les codes ROME d'une fiche", async () => {
    let { buildReferentiel, findRNCP } = referentiel(getTestFile("rncp.xml"), getTestFile("rncp-mapping.csv"));

    await buildReferentiel();

    assert.deepStrictEqual(findRNCP("EDUCNAT1").getCodesROME(), ["I1607", "D1211"]);
    assert.deepStrictEqual(findRNCP("UNKNOWN").getCodesROME(), []);
  });

  it("Retourne des statistiques d'imports", async () => {
    let { buildReferentiel } = referentiel(getTestFile("rncp.xml"), getTestFile("rncp-mapping.csv"));

    let stats = await buildReferentiel();

    assert.deepStrictEqual(stats, {
      errors: 0,
      total: 1,
    });
  });

  it("Gère un fichier xml invalide", async () => {
    let { buildReferentiel } = referentiel(getTestFile("rncp-invalid.xml"), getTestFile("rncp-mapping.csv"));

    let stats = await buildReferentiel();

    assert.deepStrictEqual(stats, {
      errors: 1,
      total: 0,
    });
  });

  it("Ignore les lignes invalides d'un fichier CSV", async () => {
    let { buildReferentiel } = referentiel(getTestFile("rncp.xml"), getTestFile("rncp-mapping-invalid.csv"));

    let stats = await buildReferentiel();

    assert.deepStrictEqual(stats, {
      errors: 0,
      total: 1,
    });
  });
});
