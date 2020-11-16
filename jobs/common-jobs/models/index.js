const { mongooseInstance: mongooseInst } = require("../../../common/mongo");
const { mongoosastic, getElasticInstance } = require("../../../common/esClient");

const { establishmentSchema, trainingSchema, domainesMetiersSchema, psFormations } = require("../../../common/models");

const getModel = (MODELNAME, schema, mongooseInstance = mongooseInst, stage = null) => {
  const Schema = new mongooseInstance.Schema(schema);
  Schema.plugin(mongoosastic, { esClient: getElasticInstance(stage), index: MODELNAME });
  Schema.plugin(require("mongoose-paginate"));
  return mongooseInstance.model(MODELNAME, Schema);
};

module.exports = {
  Establishment: getModel("etablissements", establishmentSchema),
  Formation: getModel("formations", trainingSchema),
  DomainesMetiers: getModel("domainesmetiers", domainesMetiersSchema),
  psFormations: getModel("psFormations", psFormations),
  attachFormationTo: (minst, stage) => getModel("formations", trainingSchema, minst, stage),
  attachEstablishmentTo: (minst, stage) => getModel("etablissements", establishmentSchema, minst, stage),
  attachDomainesMetiersTo: (minst, stage) => getModel("domainesmetiers", domainesMetiersSchema, minst, stage),
};
