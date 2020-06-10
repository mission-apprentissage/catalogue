const { mongooseInstance: mongooseInst } = require("../mongo");
const { mongoosastic, getElasticInstance } = require("../esClient");

const { establishmentSchema, trainingSchema } = require("../models");

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

module.exports = {
  Establishment: e,
  Formation: f,
  attachFormationTo: (minst, stage) => getModel("formations", trainingSchema, minst, stage),
  attachEstablishmentTo: (minst, stage) => getModel("etablissements", establishmentSchema, minst, stage),
};
