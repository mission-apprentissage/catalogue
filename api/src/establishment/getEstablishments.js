import { connectToMongo, closeMongoConnection } from "../../../common/mongo";
import { success, failure } from "../common-api/response";
import { Establishment } from "../models";

export default async (event, context) => {
  // eslint-disable-next-line no-param-reassign
  context.callbackWaitsForEmptyEventLoop = false;

  const qs = event.queryStringParameters || null;
  const query = qs && qs.query ? JSON.parse(qs.query) : {};
  const page = qs && qs.page ? qs.page : 1;
  const limit = qs && qs.limit ? qs.limit : 10;

  try {
    await connectToMongo();
    const results = await Establishment.paginate(query, { page, limit });
    closeMongoConnection();
    /**
     *  Response
     * */
    return success({
      etablissements: results.docs,
      pagination: {
        page: results.page,
        resultats_par_page: limit,
        nombre_de_page: results.pages,
        total: results.total,
      },
    });
  } catch (error) {
    return failure({
      error,
    });
  }
};
