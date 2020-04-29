const mongoose = require("mongoose");
const { mongoosastic, getElasticInstance } = require("../esClient");

const trainingSchema = require("../../../api/src/models/formationSchema");

const MODELNAME = "formations";

exports.Schema = trainingSchema;

const attachFormationTo = (mongooseInstance, stage) => {
  const Schema = new mongooseInstance.Schema(trainingSchema);
  Schema.plugin(mongoosastic, { esClient: getElasticInstance(stage), index: MODELNAME });
  const OBJ = mongooseInstance.model(MODELNAME, Schema);
  return OBJ;
};

const Schema = new mongoose.Schema(trainingSchema);
Schema.plugin(mongoosastic, { esClient: getElasticInstance(), index: MODELNAME });
const OBJ = mongoose.model(MODELNAME, Schema);
module.exports = OBJ;

module.exports = {
  Formation: OBJ,
  attachFormationTo,
};
