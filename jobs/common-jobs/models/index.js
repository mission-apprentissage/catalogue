const { mongooseInstance: mongooseInst } = require("../../../common/mongo");
const { mongoosastic, getElasticInstance } = require("../../../common/esClient");

const { establishmentSchema, trainingSchema, pivotRomesMetiersSchema } = require("../../../common/models");

const getModel = (MODELNAME, schema, mongooseInstance = mongooseInst, stage = null) => {
  const Schema = new mongooseInstance.Schema(schema);
  Schema.plugin(mongoosastic, { esClient: getElasticInstance(stage), index: MODELNAME });
  Schema.plugin(require("mongoose-paginate"));
  return mongooseInstance.model(MODELNAME, Schema);
};

module.exports = {
  Establishment: getModel("etablissements", establishmentSchema),
  Formation: getModel("formations", trainingSchema),
  RomesMetiers: getModel("pivotRomesMetiers", pivotRomesMetiersSchema),
  attachFormationTo: (minst, stage) => getModel("formations", trainingSchema, minst, stage),
  attachEstablishmentTo: (minst, stage) => getModel("etablissements", establishmentSchema, minst, stage),
  attachRomesMetiersTo: (minst, stage) => getModel("pivotRomesMetiers", pivotRomesMetiersSchema, minst, stage),
};
