import { connectToMongo } from "../../../common/mongo";
import { success, failure } from "../common-api/response";
import { Formation } from "../models";

export default async (event, context) => {
  // eslint-disable-next-line no-param-reassign
  context.callbackWaitsForEmptyEventLoop = false;

  const filter = event.queryStringParameters ? event.queryStringParameters : {};

  try {
    await connectToMongo();
    const count = await Formation.countDocuments(filter);

    return success({
      count,
    });
  } catch (error) {
    return failure({
      error,
    });
  }
};
