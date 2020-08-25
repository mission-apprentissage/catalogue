const { mongooseInstance: mongooseInst } = require("./mongo");
const { mongoosastic, getElasticInstance } = require("./esClient");

const { establishmentSchema, trainingSchema, domainesMetiersSchema } = require("./schemas");

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

let d = null;
if (!d) {
  d = getModel("domainesmetiers", domainesMetiersSchema);
}

module.exports = {
  Establishment: e,
  Formation: f,
  DomainesMetiers: d,
  attachFormationTo: (minst, stage) => getModel("formations", trainingSchema, minst, stage),
  attachEstablishmentTo: (minst, stage) => getModel("etablissements", establishmentSchema, minst, stage),
  attachDomainesMetiersTo: (minst, stage) => getModel("domainesmetiers", domainesMetiersSchema, minst, stage),
};
