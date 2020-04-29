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
    },
  },
  dev: {
    urls: [/^mna-admin-dev.netlify.app$/g, /^deploy-preview-[0-9]+--mna-admin-dev.netlify.app$/g],
    aws: {
      apiGateway: {
        name: "api",
        region: "eu-west-3",
        endpoint: "https://4r5ojnv3cg.execute-api.eu-west-3.amazonaws.com/dev",
      },
      cognito: {
        region: "eu-west-1",
        userPoolId: "eu-west-1_56HNtjDYs",
        userPoolWebClientId: "6hja5oevagicnu603gjs225e0g",
        identityPoolId: "eu-west-1:8cfbc754-898e-48da-9cec-8e91d6dc2b7b",
      },
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
    },
  },
};

const hostname = window.location.hostname;
let env = null;
export const getEnvName = () => {
  if (env) {
    return env;
  }
  if (config.dev.urls.some((regexp) => regexp.test(hostname))) {
    env = "dev";
  } else if (config.prod.urls.some((regexp) => regexp.test(hostname))) {
    env = "prod";
  } else {
    env = "local";
  }
  return env;
};

export const getConfig = (envName) => {
  switch (envName) {
    case "prod":
      return config.prod.aws;
    case "dev":
      return config.dev.aws;
    default:
      return config.local.aws;
  }
};

export default getConfig(getEnvName());
