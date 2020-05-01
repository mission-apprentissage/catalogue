import { connectToMongo } from "../../../common/mongo";
import { success, failure, notFound } from "../utils/response";
import { Establishment } from "../models";

export default async (event, context) => {
  // eslint-disable-next-line no-param-reassign
  context.callbackWaitsForEmptyEventLoop = false;

  const { id: idEtablissement } = event.pathParameters;

  try {
    await connectToMongo();
    const establishment = await Establishment.findById(idEtablissement);

    return success({
      // eslint-disable-next-line no-underscore-dangle
      ...establishment._doc,
    });
  } catch (error) {
    if (error.meta.statusCode === 404) {
      return notFound({
        error: "Not found",
      });
    }
    return failure({
      error,
    });
  }
};
