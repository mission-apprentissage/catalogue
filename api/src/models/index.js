import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate";
import { mongoosastic, getElasticInstance } from "../utils/es";
import { establishmentSchema, trainingSchema } from "../../../common/models";

const getModel = (MODELNAME, schema) => {
  exports.Schema = schema;
  const Schema = new mongoose.Schema(schema);
  Schema.plugin(mongoosastic, { esClient: getElasticInstance(), index: MODELNAME });
  Schema.plugin(mongoosePaginate);
  return mongoose.model(MODELNAME, Schema);
};

export const Establishment = getModel("etablissements", establishmentSchema);
export const Formation = getModel("formations", trainingSchema);
