const { Client } = require("@elastic/elasticsearch");
const { AmazonConnection } = require("aws-elasticsearch-connector");
const ElasticsearchScrollStream = require("elasticsearch-scroll-stream");
const { transformObject, mergeStreams } = require("../script/streamUtils");
const mongoosastic = require("./mongoosastic");
const { getConfig } = require("../config");

const getClientOptions = envName => {
  const config = getConfig(envName);
  switch (envName) {
    case "prod":
    case "dev":
      return {
        node: `https://${config.aws.elasticsearch.endpoint}`,
        Connection: AmazonConnection,
        awsConfig: {
          credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
          },
        },
      };
    case "local":
    default:
      return { node: `http://${config.aws.elasticsearch.endpoint}` };
  }
};

const createEsInstance = (stage = null) => {
  const options = getClientOptions(stage || process.env.STAGE);
  const client = new Client({
    ...options,
    maxRetries: 5,
    requestTimeout: 60000,
  });

  client.extend("searchDocumentsAsStream", () => {
    return options => {
      return mergeStreams(
        new ElasticsearchScrollStream(
          client,
          {
            scroll: "1m",
            size: "50",
            ...options,
          },
          ["_id"]
        ),
        transformObject(data => {
          return JSON.parse(Buffer.from(data).toString());
        })
      );
    };
  });
  return client;
};

let clientDefault = createEsInstance();

// Très moche mais pas d'idée sur le moment (antoine)
let clientProd = null;
let clientDev = null;
let clientLocal = null;

const getElasticInstance = (envName = null) => {
  if (!envName) {
    return clientDefault;
  }
  switch (envName) {
    case "prod": {
      if (!clientProd) {
        clientProd = createEsInstance("prod");
      }
      return clientProd;
    }
    case "dev": {
      if (!clientDev) {
        clientDev = createEsInstance("dev");
      }
      return clientDev;
    }
    case "local":
    default: {
      if (!clientLocal) {
        clientLocal = createEsInstance("local");
      }
      return clientLocal;
    }
  }
};

module.exports = {
  getElasticInstance,
  mongoosastic,
};
