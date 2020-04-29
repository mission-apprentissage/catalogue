const config = {
  local: {
    urls: [""],
    aws: {
      apiGateway: {
        name: "api",
        region: "eu-west-3",
        endpoint: "http://localhost:3001/local",
      },
      elasticsearch: {
        endpoint: "localhost:9200",
        region: "local",
      },
    },
    mongo: {
      endpoint: "mongodb://127.0.0.1:27017",
      db: "mna-dev",
    },
  },
  dev: {
    urls: [""],
    aws: {
      apiGateway: {
        name: "api",
        region: "eu-west-3",
        endpoint: "https://4r5ojnv3cg.execute-api.eu-west-3.amazonaws.com/dev",
      },
      elasticsearch: {
        region: "eu-west-3",
        endpoint: "search-mna-es-dev-4p4det7qgnd7fp7k77kon32gwi.eu-west-3.es.amazonaws.com",
      },
      cognito: {
        userPoolId: "eu-west-1_56HNtjDYs",
        region: "eu-west-1",
      },
    },
    mongo: {
      endpoint: process.env.MONGODB_URL_DEV,
      db: process.env.MONGODB_DBNAME_DEV,
    },
  },
  prod: {
    urls: [""],
    aws: {
      apiGateway: {
        name: "api",
        region: "eu-west-3",
        endpoint: "https://c7a5ujgw35.execute-api.eu-west-3.amazonaws.com/prod",
      },
      elasticsearch: {
        region: "eu-west-3",
        endpoint: "search-mna-es-prod-uvteou2uz65vgfcijxw74p4al4.eu-west-3.es.amazonaws.com",
      },
      cognito: {
        userPoolId: "eu-west-1_G2jBocLNF",
        region: "eu-west-1",
      },
    },
    mongo: {
      endpoint: process.env.MONGODB_URL_PROD,
      db: process.env.MONGODB_DBNAME_PROD,
    },
  },
};

const getConfig = envName => {
  switch (envName) {
    case "prod":
      return config.prod;
    case "dev":
      return config.dev;
    case "local":
    default:
      return config.local;
  }
};

module.exports = {
  getConfig,
  config: getConfig(process.env.STAGE),
};
