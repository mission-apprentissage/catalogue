const { success, failure, badRequest } = require("../common-api/response");
const { getElasticInstance } = require("../common-api/es");

const esClient = getElasticInstance();

module.exports.handler = async (event, context, callback) => {
  try {
    const { index } = event.pathParameters;

    let scrollId = null;
    if (event.queryStringParameters && event.queryStringParameters.scroll_id) {
      scrollId = event.queryStringParameters.scroll_id;
    }

    if (scrollId) {
      const response = await esClient.scroll({
        scrollId,
        scroll: "1m",
      });
      callback(null, success(response.body));
    }

    if (!event.body || event.body === "") {
      callback(null, badRequest({ message: "something went wrong" }));
    }

    const response = await esClient.search({
      index,
      scroll: "1m",
      size: 100,
      body: event.body,
    });

    /**
     *  Response
     * */
    callback(null, success(response.body));
  } catch (error) {
    callback(
      null,
      failure({
        error,
      })
    );
  }
};
