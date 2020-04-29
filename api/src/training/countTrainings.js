import { connectToMongo } from "../utils/mongo";
import { success, failure } from "../utils/response";
import { Formation } from "../models";

export default async (event, context) => {
  // eslint-disable-next-line no-param-reassign
  context.callbackWaitsForEmptyEventLoop = false;

  const query = event.queryStringParameters ? event.queryStringParameters.query : {};

  try {
    await connectToMongo();
    const count = await Formation.countDocuments(query);

    return success({
      count,
    });
  } catch (error) {
    return failure({
      error,
    });
  }
};
