const { connectToMongo, closeMongoConnection } = require("../../../common/mongo");
const { success, failure } = require("../common-api/response");

global.usePaginate = true;
const { Formation } = require("../../../jobs/common-jobs/models");

module.exports.handler = async (event, context, callback) => {
  // eslint-disable-next-line no-param-reassign
  context.callbackWaitsForEmptyEventLoop = false;

  const qs = event.queryStringParameters || null;
  const query = qs && qs.query ? JSON.parse(qs.query) : {};
  const page = qs && qs.page ? qs.page : 1;
  const limit = qs && qs.limit ? parseInt(qs.limit, 10) : 10;

  try {
    await connectToMongo();
    const results = await Formation.paginate(query, { page, limit });
    closeMongoConnection();

    callback(
      null,
      success({
        formations: results.docs,
        pagination: {
          page: results.page,
          resultats_par_page: limit,
          nombre_de_page: results.pages,
          total: results.total,
        },
      })
    );
  } catch (error) {
    callback(
      null,
      failure({
        error,
      })
    );
  }
};
