import { connectToMongo, closeMongoConnection } from "../../../common/mongo";
import { success, failure } from "../common-api/response";
import { Establishment } from "../models";

export default async (event, context) => {
  // eslint-disable-next-line no-param-reassign
  context.callbackWaitsForEmptyEventLoop = false;

  const filter = event.queryStringParameters ? event.queryStringParameters : {};

  try {
    await connectToMongo();
    const count = await Establishment.countDocuments(filter);
    closeMongoConnection();
    return success({
      count,
    });
  } catch (error) {
    return failure({
      error,
    });
  }
};
