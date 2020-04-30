import Amplify, { Auth } from "aws-amplify";
import { getConfig, getEnvName } from "@config";

const config = getConfig(getEnvName(saveHost));

const configure = async () => {
  Amplify.configure({
    API: {
      endpoints: [
        {
          ...config.aws.apiGateway,
          custom_header: async () => {
            const token = await getToken();
            if (!token) return {};
            return {
              Authorization: token,
            };
          },
        },
      ],
    },
    Auth: config.aws.cognito,
  });
};

const getToken = async () => {
  let token = null;
  try {
    const user = await getCurrentUser();
    token = user ? user.attributes["custom:apiKey"] : null;
  } catch (e) {
    console.log(e);
  }

  return token;
};

export const getCurrentUser = async () => {
  try {
    const data = await Auth.currentAuthenticatedUser({
      bypassCache: false, // Optional, By default is false. If set to true, this call will send a request to Cognito to get the latest user data
    });
    if (!data.username) {
      return null;
    }
    return data;
  } catch (error) {
    console.log(error);
  }
};

export default configure;
