const AWS = require("aws-sdk");
const uuidv4 = require("uuid").v4;
const Spinner = require("cli-spinner").Spinner;
const spinner = new Spinner("%s");
spinner.setSpinnerString("|/-\\");

const handleRequest = request => {
  return new Promise((resolve, reject) => {
    const client = new AWS.HttpClient();
    client.handleRequest(
      request,
      null,
      response => {
        let responseBody = "";
        response.on("data", chunk => {
          responseBody += chunk;
        });
        response.on("end", () => {
          resolve(JSON.parse(responseBody));
        });
      },
      error => {
        console.log(`Error: ${error}`);
        reject();
      }
    );
  });
};

module.exports.handleRequest = handleRequest;

const prepareRequest = (endpoint, region) => {
  AWS.config.apiVersions = { signer: "2017-08-25" };
  AWS.config.update({ region });
  const endpointObj = new AWS.Endpoint(endpoint);

  const request = new AWS.HttpRequest(endpointObj, region);
  request.headers["host"] = endpoint;
  request.headers["Content-Type"] = "application/json";

  return request;
};

module.exports.prepareRequest = prepareRequest;

const signedRequest = request => {
  const credentials = new AWS.EnvironmentCredentials("AWS");
  const signer = new AWS.Signers.V4(request, "es");
  signer.addAuthorization(credentials, new Date());
};

module.exports.signedRequest = signedRequest;

const scroll = async (endpoint, region, scroll_id) => {
  let result = [];
  let resultLength = -1;
  do {
    const request = prepareRequest(endpoint, region);

    request.method = "GET";
    request.path += `_search/scroll`;
    request.body = JSON.stringify({ scroll: "1m", scroll_id });
    request.headers["Content-Length"] = Buffer.byteLength(request.body);

    signedRequest(request);

    const resp = await handleRequest(request);
    result = [...result, ...resp.hits.hits];
    resultLength = resp.hits.hits.length;
  } while (resultLength !== 0);

  return result;
};

module.exports.scroll = scroll;

const getEtablissements = async (endpoint, region) => {
  spinner.start();

  const request = prepareRequest(endpoint, region);
  request.method = "GET";
  request.path += `etablissements/_search`;
  request.body = JSON.stringify({
    query: {
      match_all: {},
    },
    size: 10000,
  });
  request.headers["Content-Length"] = Buffer.byteLength(request.body);

  signedRequest(request);

  const resp = await handleRequest(request);
  let result = resp.hits.hits;

  if (resp._scroll_id) {
    result = [...result, ...(await scroll(endpoint, region, resp._scroll_id))];
  }

  spinner.stop();
  console.log("");
  return result;
};

module.exports.getEtablissements = getEtablissements;

const addEtablissement = async (endpoint, region, etablissement) => {
  const request = prepareRequest(endpoint, region);
  request.method = "PUT";
  request.path += `etablissements/_doc/${etablissement.idEtablissement}`;
  request.body = JSON.stringify(etablissement);
  request.headers["Content-Length"] = Buffer.byteLength(request.body);

  signedRequest(request);
  const result = await handleRequest(request);
  if (result.error) {
    console.error(result);
  }
};

module.exports.addEtablissement = addEtablissement;

const removeEtablissement = async (endpoint, region, idEtablissement) => {
  const request = prepareRequest(endpoint, region);
  request.method = "DELETE";
  request.path += `etablissements/_doc/${idEtablissement}`;
  signedRequest(request);

  const resp = await handleRequest(request);
  if (resp.result !== "deleted") console.log(resp);
};

module.exports.removeEtablissement = removeEtablissement;

const getFormations = async (endpoint, region) => {
  spinner.start();

  const request = prepareRequest(endpoint, region);

  request.method = "GET";
  request.path += `formations/_search?scroll=1m`;
  request.body = JSON.stringify({
    query: {
      match_all: {},
    },
    size: 1000,
  });
  request.headers["Content-Length"] = Buffer.byteLength(request.body);

  signedRequest(request);

  const resp = await handleRequest(request);
  let result = resp.hits.hits;

  result = [...result, ...(await scroll(endpoint, region, resp._scroll_id))];

  spinner.stop();
  console.log("");
  return result;
};

module.exports.getFormations = getFormations;

const removeFormation = async (endpoint, region, idFormation) => {
  const request = prepareRequest(endpoint, region);
  request.method = "DELETE";
  request.path += `formations/_doc/${idFormation}`;
  signedRequest(request);

  const resp = await handleRequest(request);
  if (resp.result !== "deleted") console.log(resp);
};

module.exports.removeFormation = removeFormation;

const findEntryById = async (index, endpoint, region, uuid) => {
  const request = prepareRequest(endpoint, region);
  request.method = "GET";
  request.path += `${index}/_doc/${uuid}`;

  signedRequest(request);

  const resp = await handleRequest(request);

  return resp.found;
};

const generateUUID = async (index, endpoint, region) => {
  const uuid = uuidv4();
  const exist = await findEntryById(index, endpoint, region, uuid);
  if (exist) {
    return generateUUID(index, endpoint, region);
  }
  return uuid;
};

module.exports.generateUUID = generateUUID;

const esSearch = async (index, endpoint, region, query) => {
  spinner.start();

  const request = prepareRequest(endpoint, region);
  request.method = "GET";
  request.path += `${index}/_search`;
  request.body = JSON.stringify(query);
  request.headers["Content-Length"] = Buffer.byteLength(request.body);

  signedRequest(request);

  const result = await handleRequest(request);

  spinner.stop();
  return result.hits ? (result.hits.hits.length > 0 ? result.hits.hits[0] : null) : null;
};

module.exports.esSearch = esSearch;

const updateTraining = async (endpoint, region, id, doc) => {
  // Update Data Request
  const request = prepareRequest(endpoint, region);
  request.method = "POST";
  request.path += `formations/_update/${id}`;
  request.body = JSON.stringify({
    doc,
  });
  request.headers["Content-Length"] = Buffer.byteLength(request.body);
  signedRequest(request);
  return await handleRequest(request);
};

module.exports.updateTraining = updateTraining;
