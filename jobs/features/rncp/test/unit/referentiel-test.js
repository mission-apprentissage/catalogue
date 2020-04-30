const assert = require("assert");
const fs = require("fs");
const path = require("path");
const createReferentiel = require("../../src/rncp/referentiel");

const getInputStream = fileName => {
  return fs.createReadStream(path.join(__dirname, "..", "data", fileName));
};

describe(__filename, () => {
  it("Vérifie qu'un codeEducNat peut-être transcodé en code RNCP", async () => {
    let referentiel = createReferentiel();

    await referentiel.loadXmlFile(getInputStream("rncp.xml"), getInputStream("rncp-mapping.csv"));

    assert.strictEqual(referentiel.findRNCP("EDUCNAT1").getCode(), "RNCPXXXX1");
    assert.strictEqual(referentiel.findRNCP("UNKNOWN").getCode(), null);
  });

  it("Vérifie qu'on peut obtenir le libelle d'une fiche RNCP", async () => {
    let referentiel = createReferentiel();

    await referentiel.loadXmlFile(getInputStream("rncp.xml"), getInputStream("rncp-mapping.csv"));

    assert.strictEqual(referentiel.findRNCP("EDUCNAT1").getLibelle(), "MASTER");
    assert.strictEqual(referentiel.findRNCP("UNKNOWN").getLibelle(), null);
  });

  it("Vérifie l'habilitation d'un organisme partenaire avec habilitation à former", async () => {
    let referentiel = createReferentiel();

    await referentiel.loadXmlFile(getInputStream("rncp.xml"), getInputStream("rncp-mapping.csv"));
    let rncp = referentiel.findRNCP("EDUCNAT1");

    assert.strictEqual(rncp.isHabilite("22222222222222"), true);
    assert.strictEqual(rncp.isHabilite("22222222211111"), true);
  });

  it("Vérifie l'habilitation d'un organisme partenaire sans habilitation à former", async () => {
    let referentiel = createReferentiel();

    await referentiel.loadXmlFile(getInputStream("rncp.xml"), getInputStream("rncp-mapping.csv"));

    assert.strictEqual(referentiel.findRNCP("EDUCNAT1").isHabilite("22222222200000"), false);
  });

  it("Vérifie l'habilitation d'un organisme certificateur", async () => {
    let referentiel = createReferentiel();

    await referentiel.loadXmlFile(getInputStream("rncp.xml"), getInputStream("rncp-mapping.csv"));

    assert.strictEqual(referentiel.findRNCP("EDUCNAT1").isHabilite("11111111111111"), true);
  });

  it("Vérifie l'habilitation d'un organisme inconnu", async () => {
    let referentiel = createReferentiel();

    await referentiel.loadXmlFile(getInputStream("rncp.xml"), getInputStream("rncp-mapping.csv"));

    assert.strictEqual(referentiel.findRNCP("EDUCNAT1").isHabilite("UNKNOWN"), false);
  });

  it("Vérifie qu'une fiche est eligible s'elle est en enregistrement de droit", async () => {
    let referentiel = createReferentiel();

    await referentiel.loadXmlFile(getInputStream("rncp.xml"), getInputStream("rncp-mapping.csv"));

    assert.strictEqual(referentiel.findRNCP("EDUCNAT1").isEligibleApprentissage(), true);
  });

  it("Vérifie qu'une fiche est eligible s'elle est en enregistrement sur demande et jury CA", async () => {
    let referentiel = createReferentiel();

    await referentiel.loadXmlFile(
      getInputStream("rncp-enregistrement-sur-demande-et-jury.xml"),
      getInputStream("rncp-mapping.csv")
    );

    assert.strictEqual(referentiel.findRNCP("EDUCNAT1").isEligibleApprentissage(), true);
  });

  it("Vérifie qu'une fiche est eligible si elle est en enregistrement sur demande mais sans jury CA", async () => {
    let referentiel = createReferentiel();

    await referentiel.loadXmlFile(
      getInputStream("rncp-enregistrement-sur-demande.xml"),
      getInputStream("rncp-mapping.csv")
    );

    assert.strictEqual(referentiel.findRNCP("EDUCNAT1").isEligibleApprentissage(), false);
  });

  it("Vérifie qu'une fiche n'est pas eligible si elle est inconnue", async () => {
    let referentiel = createReferentiel();

    await referentiel.loadXmlFile(getInputStream("rncp.xml"), getInputStream("rncp-mapping.csv"));

    assert.strictEqual(referentiel.findRNCP("UNKNOWN").isEligibleApprentissage(), false);
  });

  it("Permet d'obtenir les codes ROME d'une fiche", async () => {
    let referentiel = createReferentiel();

    await referentiel.loadXmlFile(getInputStream("rncp.xml"), getInputStream("rncp-mapping.csv"));

    assert.deepStrictEqual(referentiel.findRNCP("EDUCNAT1").getCodesROME(), ["I1607", "D1211"]);
    assert.deepStrictEqual(referentiel.findRNCP("UNKNOWN").getCodesROME(), []);
  });

  it("Retourne des statistiques d'imports", async () => {
    let referentiel = createReferentiel();

    let stats = await referentiel.loadXmlFile(getInputStream("rncp.xml"), getInputStream("rncp-mapping.csv"));

    assert.deepStrictEqual(stats, {
      errors: 0,
      total: 1,
    });
  });

  it("Gère un fichier xml invalide", async () => {
    let referentiel = createReferentiel();

    let stats = await referentiel.loadXmlFile(getInputStream("rncp-invalid.xml"), getInputStream("rncp-mapping.csv"));

    assert.deepStrictEqual(stats, {
      errors: 1,
      total: 0,
    });
  });

  it("Ignore les lignes invalides d'un fichier CSV", async () => {
    let referentiel = createReferentiel();

    let stats = await referentiel.loadXmlFile(getInputStream("rncp.xml"), getInputStream("rncp-mapping-invalid.csv"));

    assert.deepStrictEqual(stats, {
      errors: 0,
      total: 1,
    });
  });
});
