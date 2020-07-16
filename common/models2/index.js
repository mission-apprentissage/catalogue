const { mongooseInstance: mongooseInst } = require("../mongo");
const { mongoosastic, getElasticInstance } = require("../esClient");

const { establishmentSchema, trainingSchema, pivotRomesMetiersSchema } = require("../models");

const getModel = (MODELNAME, schema, mongooseInstance = mongooseInst, stage = null) => {
  const Schema = new mongooseInstance.Schema(schema);
  Schema.plugin(mongoosastic, { esClient: getElasticInstance(stage), index: MODELNAME });
  Schema.plugin(require("mongoose-paginate"));
  return mongooseInstance.model(MODELNAME, Schema);
};

let e = null;
if (!e) {
  e = getModel("etablissements", establishmentSchema);
}

let f = null;
if (!f) {
  f = getModel("formations", trainingSchema);
}

let pRM = null;
if (!pRM) {
  pRM = getModel("pivotRomesMetiers", pivotRomesMetiersSchema);
}

module.exports = {
  Establishment: e,
  Formation: f,
  RomesMetiers: pRM,
  attachFormationTo: (minst, stage) => getModel("formations", trainingSchema, minst, stage),
  attachEstablishmentTo: (minst, stage) => getModel("etablissements", establishmentSchema, minst, stage),
  attachRomesMetiersTo: (minst, stage) => getModel("pivotRomesMetiers", pivotRomesMetiersSchema, minst, stage),
};
