const { describe, it, before, after } = require("mocha");
const assert = require("assert");
const asyncForEach = require("../../../../common-jobs/utils").asyncForEach;
const importer = require("../importer/importer");
const { formationsJ, formationsJMinus1, formationsJPlus1, formationsJPlus2, adding } = require("./fixtures");
const { connectToMongo, closeMongoConnection } = require("../../../../../common/mongo");
const { RcoFormations } = require("../../../../../common/models2");

describe(__filename, () => {
  before(async () => {
    // Connection to test collection
    await connectToMongo(null, "test");
    await RcoFormations.deleteMany({});
    const collection = importer.lookupDiff(formationsJMinus1, []);
    const result = await importer.addedFormationsHandler(collection.added);
    importer.addtoDbTasks(result);
    await importer.dbOperationsHandler();
    importer.resetReport();
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

    const resultAdded = await importer.addedFormationsHandler(collection.added);
    importer.addtoDbTasks(resultAdded);

    const resultUpdated = await importer.updatedFormationsHandler(collection.updated);
    importer.addtoDbTasks(resultUpdated);

    await importer.dbOperationsHandler();

    assert.deepStrictEqual(resultAdded, {
      toAddToDb: [adding],
      toUpdateToDb: [],
    });

    const count = await RcoFormations.countDocuments({});
    assert.equal(count, 231);

    const updatedFormation = await importer.getRcoFormation({
      id_formation: "24_208037",
      id_action: "24_1462311",
      id_certifinfo: "106623",
    });

    assert.deepStrictEqual(updatedFormation.periode, ["2021-11", "2021-12"]);
    assert.deepStrictEqual(updatedFormation.updates_history[0].from, { periode: ["2021-11"] });
    assert.deepStrictEqual(updatedFormation.updates_history[0].to, { periode: ["2021-11", "2021-12"] });

    //importer.report();
    importer.resetReport();
  });

  it("lookupDiff >> Si Supression entre 2 jours doit dépublier la formation en db", async () => {
    const collection = importer.lookupDiff(formationsJPlus1, formationsJ);

    const resultDeleted = await importer.deletedFormationsHandler(collection.deleted);
    importer.addtoDbTasks(resultDeleted);

    await importer.dbOperationsHandler();

    assert.deepStrictEqual(resultDeleted.toUpdateToDb[0].updateInfo, { published: false });

    const count = await RcoFormations.countDocuments({});
    assert.equal(count, 231);

    importer.report();
    importer.resetReport();
  });
  // it("lookupDiff >> Si Ajout doit retourner la(es) formation(s) ajoutée(s)", async () => {
  //   const collection = importer.lookupDiff(formationsJPlus2, formationsJPlus1); // REACTIVER LA FORMATION
  //   assert.deepStrictEqual(collection, {
  //     added: [reAdded],
  //     updated: [],
  //     deleted: [],
  //   });
  // });
});
