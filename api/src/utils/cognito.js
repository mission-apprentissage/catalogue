import AWS from "aws-sdk";
import { config } from "../../../config";

const cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider({
  region: config.aws.cognito.region,
});

export const getUserFromToken = AccessToken =>
  new Promise((resolve, reject) => {
    const params = {
      AccessToken,
    };
    cognitoIdentityServiceProvider.getUser(params, (err, data) => {
      if (err) reject(err, err.stack); // an error occurred
      resolve(data);
    });
  });

export const userIsSuperAdmin = user =>
  new Promise((resolve, reject) => {
    const params = {
      UserPoolId: config.aws.cognito.userPoolId,
      Username: user.Username,
    };
    cognitoIdentityServiceProvider.adminListGroupsForUser(params, (err, data) => {
      if (err) reject(err, err.stack); // an error occurred

      const groupSuper = data.Groups.find(a => a.GroupName === "super");
      if (!groupSuper) reject(new Error("Not admin"));
      resolve(true);
    });
  });

export const listUsers = (attributesToGet = []) =>
  new Promise((resolve, reject) => {
    const params = {
      UserPoolId: config.aws.cognito.userPoolId,
    };

    if (attributesToGet.length > 0) params.AttributesToGet = attributesToGet;

    cognitoIdentityServiceProvider.listUsers(params, (err, data) => {
      if (err) reject(err, err.stack); // an error occurred
      resolve(data);
    });
  });

export async function getAllUsersByAttributes(attributesToGet = []) {
  try {
    const response = await listUsers(attributesToGet);
    return response.Users;
  } catch (error) {
    console.log(error);
  }
  return [];
}

export async function findUserByAttribute(lookup, attributesToGet = []) {
  try {
    const allUsers = await getAllUsersByAttributes(attributesToGet);
    const user =
      allUsers.find(u => {
        const uAttr = u.Attributes.find(a => a.Name === lookup.name);
        return uAttr.Value === lookup.value;
      }) || null;

    if (!user) return null;

    return {
      ...user,
      Attributes: Object.assign(...user.Attributes.map(attr => ({ [attr.Name]: attr.Value }))),
    };
  } catch (error) {
    console.log(error);
  }
  return null;
}

export async function getUserInformation(token = null) {
  let userId = "Guest";
  let user = {};
  let session = null;
  try {
    user = await getUserFromToken(token);
    userId = user.Username;
  } catch (error) {
    console.log(error);
    session = JSON.stringify(token);
  }
  return {
    user,
    userId,
    session,
  };
}

export const updateUser = (username, attr) =>
  new Promise((resolve, reject) => {
    const params = {
      UserAttributes: [
        ...attr,
        {
          Name: "email_verified",
          Value: "true",
        },
      ],
      UserPoolId: config.aws.cognito.userPoolId /* required */,
      Username: username /* required */,
    };
    cognitoIdentityServiceProvider.adminUpdateUserAttributes(params, (err, data) => {
      if (err) reject(err, err.stack); // an error occurred
      resolve(data);
    });
  });

export const deleteUser = username =>
  new Promise((resolve, reject) => {
    const params = {
      UserPoolId: config.aws.cognito.userPoolId /* required */,
      Username: username /* required */,
    };
    cognitoIdentityServiceProvider.adminDeleteUser(params, (err, data) => {
      if (err) reject(err, err.stack); // an error occurred
      resolve(data);
    });
  });

export const createUser = user =>
  new Promise((resolve, reject) => {
    const params = {
      UserPoolId: config.aws.cognito.userPoolId /* required */,
      Username: user.newUsername /* required */,
      DesiredDeliveryMediums: ["EMAIL"],
      TemporaryPassword: user.newTmpPassword,
      UserAttributes: [
        {
          Name: "custom:access_all" /* required */,
          Value: user.accessAll ? "true" : "false",
        },
        {
          Name: "email_verified",
          Value: "true",
        },
        {
          Name: "email",
          Value: user.newEmail,
        },
        {
          Name: "custom:apiKey",
          Value: user.apiKey,
        },
        {
          Name: "custom:access_academie",
          Value: user.accessAcademie,
        },
      ],
    };
    cognitoIdentityServiceProvider.adminCreateUser(params, (err, data) => {
      if (err) reject(err, err.stack); // an error occurred
      resolve(data);
    });
  });
