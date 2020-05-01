import mongoosePaginate from "mongoose-paginate";
import { mongooseInstance as mongoose } from "../../../common/mongo";
import { establishmentSchema, trainingSchema } from "../../../common/models";
import { mongoosastic, getElasticInstance } from "../common-api/es";

const getModel = (MODELNAME, schema) => {
  exports.Schema = schema;
  const Schema = new mongoose.Schema(schema);
  Schema.plugin(mongoosastic, { esClient: getElasticInstance(), index: MODELNAME });
  Schema.plugin(mongoosePaginate);
  return mongoose.model(MODELNAME, Schema);
};

export const Establishment = getModel("etablissements", establishmentSchema);
export const Formation = getModel("formations", trainingSchema);
