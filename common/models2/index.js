const { mongooseInstance: mongooseInst } = require("../mongo");
const { mongoosastic, getElasticInstance } = require("../esClient");

const { establishmentSchema, trainingSchema, domainesMetiersSchema, rcoFormationsSchema } = require("../models");

const getModel = (MODELNAME, schema, mongooseInstance = mongooseInst, stage = null) => {
  const Schema = new mongooseInstance.Schema(schema);
  Schema.plugin(mongoosastic, { esClient: getElasticInstance(stage), index: MODELNAME });
  Schema.plugin(require("mongoose-paginate"));
  if (MODELNAME === "etablissements") Schema.index({ adresse: "text" });
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

let r = null;
if (!r) {
  r = getModel("rcoformations", rcoFormationsSchema);
}

module.exports = {
  Establishment: e,
  Formation: f,
  DomainesMetiers: d,
  RcoFormations: r,
  attachFormationTo: (minst, stage) => getModel("formations", trainingSchema, minst, stage),
  attachEstablishmentTo: (minst, stage) => getModel("etablissements", establishmentSchema, minst, stage),
  attachDomainesMetiersTo: (minst, stage) => getModel("domainesmetiers", domainesMetiersSchema, minst, stage),
  attachRcoFormationsTo: (minst, stage) => getModel("rcoformations", rcoFormationsSchema, minst, stage),
};
