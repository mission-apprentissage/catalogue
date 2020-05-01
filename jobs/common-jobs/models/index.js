const { mongooseInstance: mongooseInst } = require("../../../common/mongo");
const { mongoosastic, getElasticInstance } = require("../../../common/esClient");

const { establishmentSchema, trainingSchema } = require("../../../common/models");

const getModel = (MODELNAME, schema) => {
  exports.Schema = schema;
  const Schema = new mongooseInst.Schema(schema);
  Schema.plugin(mongoosastic, { esClient: getElasticInstance(), index: MODELNAME });
  return mongooseInst.model(MODELNAME, Schema);
};

const attachModelToEnv = (MODELNAME, schema, mongooseInstance, stage) => {
  const Schema = new mongooseInstance.Schema(schema);
  Schema.plugin(mongoosastic, { esClient: getElasticInstance(stage), index: MODELNAME });
  const OBJ = mongooseInstance.model(MODELNAME, Schema);
  return OBJ;
};

module.exports = {
  Establishment: getModel("etablissements", establishmentSchema),
  Formation: getModel("formations", trainingSchema),
  attachFormationTo: (mongooseInstance, stage) =>
    attachModelToEnv("formations", trainingSchema, mongooseInstance, stage),
  attachEstablishmentTo: (mongooseInstance, stage) =>
    attachModelToEnv("etablissements", establishmentSchema, mongooseInstance, stage),
};
