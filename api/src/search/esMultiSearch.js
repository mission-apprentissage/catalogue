const { success, failure, badRequest } = require("../common-api/response");
const { getElasticInstance } = require("../common-api/es");

const esClient = getElasticInstance();

module.exports.handler = async (event, context, callback) => {
  const { pathParameters, queryStringParameters, body } = event;
  const { index } = pathParameters;

  try {
    if (!body || body === "") {
      callback(null, badRequest({ message: "something went wrong" }));
    }

    const result = await esClient.msearch({ index, ...queryStringParameters, body });

    /**
     *  Response
     * */
    callback(null, success(result.body));
  } catch (error) {
    callback(
      null,
      failure({
        error,
      })
    );
  }
};
