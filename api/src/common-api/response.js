const buildResponse = (statusCode, body) => ({
  statusCode,
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,PATCH",
    "Access-Control-Allow-Headers": "Content-Type,Authorization,X-User-Id",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Credentials": true,
  },
  body: JSON.stringify(body),
});

const success = body => {
  return buildResponse(200, body);
};
module.exports.success = success;

const failure = body => {
  console.log(body.error);
  return buildResponse(500, body);
};
module.exports.failure = failure;

const notFound = body => {
  return buildResponse(404, body);
};
module.exports.notFound = notFound;

const badRequest = body => {
  return buildResponse(400, body);
};
module.exports.badRequest = badRequest;
