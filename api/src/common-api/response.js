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

export function success(body) {
  return buildResponse(200, body);
}

export function failure(body) {
  console.log(body.error);
  return buildResponse(500, body);
}

export function notFound(body) {
  return buildResponse(404, body);
}

export function badRequest(body) {
  return buildResponse(400, body);
}
