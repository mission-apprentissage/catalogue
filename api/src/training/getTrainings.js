import { connectToMongo } from "../../../common/mongo";
import { success, failure } from "../common-api/response";
import { Formation } from "../models";

export default async (event, context) => {
  // eslint-disable-next-line no-param-reassign
  context.callbackWaitsForEmptyEventLoop = false;

  try {
    const qs = event.queryStringParameters || null;
    const query = qs && qs.query ? qs.query : {};
    const page = qs && qs.page ? qs.page : 1;
    const limit = qs && qs.limit ? qs.limit : 10;

    console.log(qs, query, { page, limit });
    await connectToMongo();
    const results = await Formation.paginate(query, { page, limit });
    /**
     *  Response
     * */
    return success({
      formations: results.docs,
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
