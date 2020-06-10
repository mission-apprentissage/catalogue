const { mongooseInstance: mongooseInst } = require("../mongo");
const { mongoosastic, getElasticInstance } = require("../esClient");

const { establishmentSchema, trainingSchema } = require("../models");

const getModel = (MODELNAME, schema, mongooseInstance = mongooseInst, stage = null) => {
  const Schema = new mongooseInstance.Schema(schema);
  Schema.plugin(mongoosastic, { esClient: getElasticInstance(stage), index: MODELNAME });
  Schema.plugin(require("mongoose-paginate"));
  return mongooseInstance.model(MODELNAME, Schema);
};

module.exports = {
  Establishment: getModel("etablissements", establishmentSchema, mongooseInst, null),
  Formation: getModel("formations", trainingSchema, mongooseInst, null),
  attachFormationTo: (minst, stage) => getModel("formations", trainingSchema, minst, stage),
  attachEstablishmentTo: (minst, stage) => getModel("etablissements", establishmentSchema, minst, stage),
};
