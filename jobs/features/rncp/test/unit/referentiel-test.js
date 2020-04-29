const assert = require("assert");
const referentiel = require("../../src/rncp/referentiel");
const getTestFile = require("../data/getTestFile");

describe(__filename, () => {
  it("Vérifie qu'un codeEducNat peut-être transcodé en code RNCP", async () => {
    let { buildReferentiel, getCodeRNCP } = referentiel(getTestFile("rncp.xml"), getTestFile("rncp-mapping.csv"));

    await buildReferentiel();

    assert.strictEqual(getCodeRNCP("EDUCNAT1"), "RNCPXXXX1");
    assert.strictEqual(getCodeRNCP("UNKNOWN"), null);
  });

  it("Vérifie l'habilitation d'un organisme partenaire avec habilitation à former", async () => {
    let { buildReferentiel, isHabilite } = referentiel(getTestFile("rncp.xml"), getTestFile("rncp-mapping.csv"));

    await buildReferentiel();

    assert.strictEqual(isHabilite("RNCPXXXX1", "22222222222222"), true);
    assert.strictEqual(isHabilite("RNCPXXXX1", "22222222211111"), true);
  });

  it("Vérifie l'habilitation d'un organisme partenaire sans habilitation à former", async () => {
    let { buildReferentiel, isHabilite } = referentiel(getTestFile("rncp.xml"), getTestFile("rncp-mapping.csv"));

    await buildReferentiel();

    assert.strictEqual(isHabilite("RNCPXXXX1", "22222222200000"), false);
  });

  it("Vérifie l'habilitation d'un organisme certificateur", async () => {
    let { buildReferentiel, isHabilite } = referentiel(getTestFile("rncp.xml"), getTestFile("rncp-mapping.csv"));

    await buildReferentiel();

    assert.strictEqual(isHabilite("RNCPXXXX1", "11111111111111"), true);
  });

  it("Vérifie l'habilitation d'un organisme inconnu", async () => {
    let { buildReferentiel, isHabilite } = referentiel(getTestFile("rncp.xml"), getTestFile("rncp-mapping.csv"));

    await buildReferentiel();

    assert.strictEqual(isHabilite("RNCPXXXX1", "UNKNOWN"), false);
  });

  it("Vérifie qu'une fiche est eligible s'elle est en enregistrement de droit", async () => {
    let { buildReferentiel, isEligibleApprentissage } = referentiel(
      getTestFile("rncp.xml"),
      getTestFile("rncp-mapping.csv")
    );

    await buildReferentiel();

    assert.strictEqual(isEligibleApprentissage("RNCPXXXX1"), true);
  });

  it("Vérifie qu'une fiche est eligible s'elle est en enregistrement sur demande et jury CA", async () => {
    let { buildReferentiel, isEligibleApprentissage } = referentiel(
      getTestFile("rncp-enregistrement-sur-demande-et-jury.xml"),
      getTestFile("rncp-mapping.csv")
    );

    await buildReferentiel();

    assert.strictEqual(isEligibleApprentissage("RNCPXXXX1"), true);
  });

  it("Vérifie qu'une fiche est eligible si elle est en enregistrement sur demande mais sans jury CA", async () => {
    let { buildReferentiel, isEligibleApprentissage } = referentiel(
      getTestFile("rncp-enregistrement-sur-demande.xml"),
      getTestFile("rncp-mapping.csv")
    );

    await buildReferentiel();

    assert.strictEqual(isEligibleApprentissage("RNCPXXXX1"), false);
  });

  it("Vérifie qu'une fiche n'est pas eligible s'elle est inconnue", async () => {
    let { buildReferentiel, isEligibleApprentissage } = referentiel(
      getTestFile("rncp.xml"),
      getTestFile("rncp-mapping.csv")
    );

    await buildReferentiel();

    assert.strictEqual(isEligibleApprentissage("UNKNOWN"), false);
  });

  it("Permet d'obtenir les codes ROME d'une fiche", async () => {
    let { buildReferentiel, getCodesROME } = referentiel(getTestFile("rncp.xml"), getTestFile("rncp-mapping.csv"));

    await buildReferentiel();

    assert.deepStrictEqual(getCodesROME("RNCPXXXX1"), ["I1607", "D1211"]);
    assert.deepStrictEqual(getCodesROME("UNKNOWN"), []);
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
