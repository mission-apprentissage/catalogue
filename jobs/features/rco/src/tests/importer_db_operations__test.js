const { describe, it, before, after } = require("mocha");
const assert = require("assert");
const asyncForEach = require("../../../../common-jobs/utils").asyncForEach;
const importer = require("../importer/importer");
const {
  formationsJ,
  formationsJMinus1,
  formationsJPlus1,
  formationsJPlus2,
  adding,
  updated,
  deleted,
  reAdded,
} = require("./fixtures");
const { connectToMongo, closeMongoConnection } = require("../../../../../common/mongo");
const { RcoFormations } = require("../../../../../common/models2");

describe(__filename, () => {
  before(async () => {
    // Connection to test collection
    await connectToMongo(null, "test");
    await RcoFormations.deleteMany({});
    const collection = importer.lookupDiff(formationsJMinus1, []);
    const result = await importer.addedFormationsHandler(collection.added);
    await asyncForEach(result.toAddToDb, async f => {
      await importer.addRCOFormation(f);
    });
  });
  after(async () => {
    await closeMongoConnection();
  });

  it("checkAddedFormations >> Si aucunes modifications entre 2 jours ne doit retourner aucunes modifications de db", async () => {
    const collection = importer.lookupDiff(formationsJMinus1, formationsJMinus1);
    const result = await importer.addedFormationsHandler(collection);
    assert.deepStrictEqual(result, {
      toAddToDb: [],
      toUpdateToDb: [],
    });
    const count = await RcoFormations.countDocuments({});
    assert.equal(count, 230);
  });

  it("lookupDiff >> Si ajouts ou modifications entre 2 jours doit ajouter et modifier en db", async () => {
    const collection = importer.lookupDiff(formationsJ, formationsJMinus1);
    const result = await importer.addedFormationsHandler(collection.added);
    assert.deepStrictEqual(result, {
      toAddToDb: [adding],
      toUpdateToDb: [],
    });

    // UPDATE

    // assert.equal(result.addedToDb[0].rcoId, "24_208063 24_1462357 107551");
    // assert.equal(result.updatedToDb.length, 0);

    // DB CHECK
  });

  // it("lookupDiff >> Si Supression entre 2 jours doit retourner la(es) formation(s) supprimée(s)", async () => {
  //   const collection = importer.lookupDiff(formationsJPlus1, formationsJ);
  //   assert.deepStrictEqual(collection, {
  //     added: [],
  //     updated: [],
  //     deleted: [deleted],
  //   });
  // });
  // it("lookupDiff >> Si Ajout doit retourner la(es) formation(s) ajoutée(s)", async () => {
  //   const collection = importer.lookupDiff(formationsJPlus2, formationsJPlus1); // REACTIVER LA FORMATION
  //   assert.deepStrictEqual(collection, {
  //     added: [reAdded],
  //     updated: [],
  //     deleted: [],
  //   });
  // });
});
