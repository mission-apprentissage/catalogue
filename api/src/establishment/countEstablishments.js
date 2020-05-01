import { connectToMongo } from "../../../common/mongo";
import { success, failure } from "../utils/response";
import { Establishment } from "../models";

export default async (event, context) => {
  // eslint-disable-next-line no-param-reassign
  context.callbackWaitsForEmptyEventLoop = false;

  const query = event.queryStringParameters ? event.queryStringParameters.query : {};

  try {
    await connectToMongo();
    const count = await Establishment.countDocuments(query);

    return success({
      count,
    });
  } catch (error) {
    return failure({
      error,
    });
  }
};
