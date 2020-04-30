const config = {
  local: {
    urls: ["localhost:3000"],
    aws: {
      apiGateway: {
        name: "api",
        region: "local",
        endpoint: "http://localhost:3001/local",
      },
      cognito: {
        region: "eu-west-1",
        userPoolId: "eu-west-1_56HNtjDYs",
        userPoolWebClientId: "6hja5oevagicnu603gjs225e0g",
        identityPoolId: "eu-west-1:8cfbc754-898e-48da-9cec-8e91d6dc2b7b",
      },
      elasticsearch: {
        endpoint: "localhost:9200",
        region: "local",
      },
    },
    mongo: {
      endpoint: "mongodb://127.0.0.1:27017",
      db: process.env.MONGODB_DBNAME_DEV,
    },
  },
  dev: {
    urls: [/^mna-admin-dev.netlify.app$/g, /^deploy-preview-[0-9]+--mna-admin-dev.netlify.app$/g],
    aws: {
      apiGateway: {
        name: "api",
        region: "eu-west-3",
        endpoint: "https://r7mayzn08d.execute-api.eu-west-3.amazonaws.com/dev",
      },
      cognito: {
        region: "eu-west-1",
        userPoolId: "eu-west-1_56HNtjDYs",
        userPoolWebClientId: "6hja5oevagicnu603gjs225e0g",
        identityPoolId: "eu-west-1:8cfbc754-898e-48da-9cec-8e91d6dc2b7b",
      },
      elasticsearch: {
        region: "eu-west-3",
        endpoint: "search-mna-es-dev-4p4det7qgnd7fp7k77kon32gwi.eu-west-3.es.amazonaws.com",
      },
    },
    mongo: {
      endpoint: process.env.MONGODB_URL_DEV,
      db: process.env.MONGODB_DBNAME_DEV,
    },
  },
  prod: {
    urls: [/^mna-admin-prod.netlify.app$/g],
    aws: {
      apiGateway: {
        name: "api",
        region: "eu-west-3",
        endpoint: "https://c7a5ujgw35.execute-api.eu-west-3.amazonaws.com/prod",
      },
      cognito: {
        region: "eu-west-1",
        userPoolId: "eu-west-1_G2jBocLNF",
        userPoolWebClientId: "7f6l402uvs03tnviuk4oqtslqg",
        identityPoolId: "eu-west-1:6cca62cd-dfc0-414f-a2cc-c05fe5a01c18",
      },
      elasticsearch: {
        region: "eu-west-3",
        endpoint: "search-mna-es-prod-uvteou2uz65vgfcijxw74p4al4.eu-west-3.es.amazonaws.com",
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

let env = null;
const hostname = window ? window.location.hostname : "";
const getEnvName = () => {
  if (env) {
    // Env already setled
    return env;
  }
  if(!window) {
    // node env
    return process.env.STAGE;
  }
   // Browser env
   if (config.dev.urls.some((regexp) => regexp.test(hostname))) {
    env = "dev";
  } else if (config.prod.urls.some((regexp) => regexp.test(hostname))) {
    env = "prod";
  } else {
    env = "local";
  }
  return env;
}

module.exports = {
  getEnvName,
  getConfig,
  config: getConfig(getEnvName()),
};
