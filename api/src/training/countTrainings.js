import { connectToMongo, closeMongoConnection } from "../../../common/mongo";
import { success, failure } from "../common-api/response";
import { Formation } from "../models";

export default async (event, context) => {
  // eslint-disable-next-line no-param-reassign
  context.callbackWaitsForEmptyEventLoop = false;

  const qs = event.queryStringParameters || null;
  const query = qs && qs.query ? JSON.parse(qs.query) : {};

  try {
    await connectToMongo();
    const count = await Formation.countDocuments(query);
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
