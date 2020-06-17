const { success, failure, badRequest } = require("../common-api/response");
const { getElasticInstance } = require("../common-api/es");

const esClient = getElasticInstance();

module.exports.handler = async (event, context, callback) => {
  const { body } = event;

  try {
    if (!body || body === "") {
      callback(null, badRequest({ message: "something went wrong" }));
    }

    console.log({ body: [body] });
    const result = await esClient.msearch({ body: [body] });

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
