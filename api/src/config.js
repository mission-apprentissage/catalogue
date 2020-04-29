const config = {
  local: {
    es: {
      region: "eu-west-3",
      endpoint: "localhost:9200",
    },
    mongo: {
      endpoint: "mongodb://127.0.0.1:27017",
      db: "mna-dev",
    },
    cognito: {
      userPoolId: "eu-west-1_56HNtjDYs",
      region: "eu-west-1",
    },
  },
  dev: {
    es: {
      region: "eu-west-3",
      endpoint: "search-mna-es-dev-4p4det7qgnd7fp7k77kon32gwi.eu-west-3.es.amazonaws.com",
    },
    mongo: {
      endpoint: "mongodb+srv://mna-mongo-dev:bh5AdPKHGPx4LgXdG7@mna-hybak.mongodb.net",
      db: "mna-dev",
    },
    cognito: {
      userPoolId: "eu-west-1_56HNtjDYs",
      region: "eu-west-1",
    },
  },
  prod: {
    es: {
      region: "eu-west-3",
      endpoint: "search-mna-es-prod-uvteou2uz65vgfcijxw74p4al4.eu-west-3.es.amazonaws.com",
    },
    mongo: {
      endpoint: "mongodb+srv://mna-mongo-dev:bh5AdPKHGPx4LgXdG7@mna-hybak.mongodb.net",
      db: "mna-prod",
    },
    cognito: {
      userPoolId: "eu-west-1_G2jBocLNF",
      region: "eu-west-1",
    },
  },
};

const getEnv = () => {
  let envConfig = config.local;
  switch (process.env.STAGE) {
    case "dev":
      envConfig = config.dev;
      break;
    case "prod":
      envConfig = config.prod;
      break;
    default:
      envConfig = config.local;
      break;
  }
  return envConfig;
};

export default getEnv();
