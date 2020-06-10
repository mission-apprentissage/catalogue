const mongoosePaginate = require("mongoose-paginate");
const { mongooseInstance: mongooseInst } = require("../../../common/mongo");
const { establishmentSchema, trainingSchema } = require("../../../common/models");
const { mongoosastic, getElasticInstance } = require("../common-api/es");

const getModel = (MODELNAME, schema) => {
  const Schema = new mongooseInst.Schema(schema);
  Schema.plugin(mongoosastic, { esClient: getElasticInstance(), index: MODELNAME });
  Schema.plugin(mongoosePaginate);
  return mongooseInst.model(MODELNAME, Schema);
};

module.exports = {
  Establishment: getModel("etablissements", establishmentSchema),
  Formation: getModel("formations", trainingSchema),
};
