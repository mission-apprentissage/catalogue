const mongoose = require("mongoose");
const { mongoosastic, getElasticInstance } = require("../esClient");

const establishmentSchema = require("../../../api/src/models/establishmentSchema");

const MODELNAME = "etablissements";

exports.Schema = establishmentSchema;

const attachEstablishmentTo = (mongooseInstance, stage) => {
  const Schema = new mongooseInstance.Schema(establishmentSchema);
  Schema.plugin(mongoosastic, { esClient: getElasticInstance(stage), index: MODELNAME });
  const OBJ = mongooseInstance.model(MODELNAME, Schema);
  return OBJ;
};

const Schema = new mongoose.Schema(establishmentSchema);
Schema.plugin(mongoosastic, { esClient: getElasticInstance(), index: MODELNAME });
const OBJ = mongoose.model(MODELNAME, Schema);

module.exports = {
  Establishment: OBJ,
  attachEstablishmentTo,
};
