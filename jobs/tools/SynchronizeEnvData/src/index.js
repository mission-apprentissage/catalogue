// #region Imports

const mongoose = require("mongoose");
const asyncForEach = require("../../../common-jobs/utils").asyncForEach;
const logger = require("../../../common-jobs/Logger").mainLogger;
const Spinner = require("cli-spinner").Spinner;
const { connectToMongo } = require("../../../../common/mongo");
const { attachFormationTo, attachEstablishmentTo, attachDomainesMetiersTo } = require("../../../common-jobs/models");
const { getConfig } = require("../../../../config");
const { getElasticInstance } = require("../../../../common/esClient");

// #endregion

// TO MODIFY DEPENDING OF YOUR NEEDS
const FROM = "prod";
const TO = "dev";

// below script
const spinner = new Spinner("%s");
spinner.setSpinnerString("|/-\\");

let rebuildIndex = async (index, schema, env) => {
  let client = getElasticInstance(env);

  logger.info(`Removing ${env} '${index}' index...`);
  await client.indices.delete({ index });

  logger.info(`Re-creating '${index}' index with mapping...`);
  await schema.createMapping(); // this explicit call of createMapping insures that the geo points fields will be treated accordingly during indexing

  logger.info(`Rebuilding ${env} '${index}' index...`);
  //await schema.synchronize();
};

const run = async () => {
  try {
    logger.info(` -- Hydrate ${TO} ENV FROM ${FROM} ENV -- `);

    // #region Init instances
    const mongooseFROM = new mongoose.Mongoose();
    const mongooseTO = new mongoose.Mongoose();
    await connectToMongo(getConfig(FROM).mongo.endpoint, getConfig(FROM).mongo.db, mongooseFROM);
    await connectToMongo(getConfig(TO).mongo.endpoint, getConfig(TO).mongo.db, mongooseTO);

    const EstablishmentFROM = attachEstablishmentTo(mongooseFROM, FROM);
    const EstablishmentTO = attachEstablishmentTo(mongooseTO, TO);

    const FormationFROM = attachFormationTo(mongooseFROM, FROM);
    const FormationTO = attachFormationTo(mongooseTO, TO);

    const DomainesMetiersFROM = attachDomainesMetiersTo(mongooseFROM, FROM);
    const DomainesMetiersTO = attachDomainesMetiersTo(mongooseTO, TO);

    // #endregion

    logger.info(" -- Etablissements -- ");

    logger.info(`Get Etablissements from ${FROM}`);
    const fromEtablissements = await EstablishmentFROM.find({});

    logger.info(`Delete Etablissements items and index in ${TO}`);
    spinner.start();
    await EstablishmentTO.collection.deleteMany({});
    await rebuildIndex("etablissements", EstablishmentTO, TO);
    spinner.stop();

    logger.info(`Add Etablissements from ${FROM} to ${TO}`);
    spinner.start();
    await asyncForEach(fromEtablissements, async fromEtablissement => {
      const doc = new EstablishmentTO(fromEtablissement._doc);
      await doc.save();
    });
    spinner.stop();

    logger.info(" -- Formations -- ");

    logger.info(`Get Formations from ${FROM}`);
    const fromFormations = await FormationFROM.find({});

    logger.info(`Delete Formations items and index in ${TO}`);
    spinner.start();
    await FormationTO.collection.deleteMany({});
    await rebuildIndex("formations", FormationTO, TO);
    spinner.stop();

    logger.info(`Add formations from ${FROM} to ${TO}`);
    spinner.start();
    await asyncForEach(fromFormations, async fromFormation => {
      const doc = new FormationTO(fromFormation._doc);
      await doc.save();
    });
    spinner.stop();

    logger.info(" -- DomainesMetiers -- ");

    logger.info(`Get DomainesMetiers from ${FROM}`);
    const fromDomainesMetiers = await DomainesMetiersFROM.find({});

    logger.info(`Delete DomainesMetiers items and index in ${TO}`);
    spinner.start();
    await DomainesMetiersTO.collection.deleteMany({});
    await rebuildIndex("domainesmetiers", DomainesMetiersTO, TO);
    spinner.stop();

    logger.info(`Add domainesmetiers from ${FROM} to ${TO}`);
    spinner.start();
    await asyncForEach(fromDomainesMetiers, async fromDomaineMetier => {
      const doc = new DomainesMetiersTO(fromDomaineMetier._doc);
      await doc.save();
    });
    spinner.stop();

    logger.info(` -- END Hydrate ${TO} ENV FROM ${FROM} ENV -- `);
  } catch (err) {
    console.log(err);
  }
};

run();
