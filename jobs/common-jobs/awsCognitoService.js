// #region Imports

const logger = require("./Logger").mainLogger;
const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");
const { config } = require("../../config");
// #endregion

// Cognito Default Values
const defaultPassword = "1MotDePassTemporaire!";

class AwsCognitoService {
  constructor() {
    AWS.config.region = config.aws.cognito.region;
    this.cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider();
  }

  /**
   * Get an AWS Cognito User
   * @param {*} user
   */
  getCognitoUser(user) {
    try {
      var params = {
        UserPoolId: config.aws.cognito.userPoolId /* required */,
        Username: user.userName,
      };

      return this.cognitoidentityserviceprovider.adminGetUser(params, function(err) {
        if (err) logger.error(err, err.stack);
      });
    } catch (err) {
      logger.error(err);
      return null;
    }
  }

  /**
   * Create an AWS Cognito User
   * @param {*} userToCreate
   */
  createCognitoUser(userToCreate) {
    try {
      var params = {
        UserPoolId: config.aws.cognito.userPoolId /* required */,
        Username: userToCreate.userName,
        DesiredDeliveryMediums: ["EMAIL"],
        TemporaryPassword: defaultPassword,
        UserAttributes: [
          {
            Name: "custom:access_all" /* required */,
            Value: userToCreate.accessAll,
          },
          {
            Name: "email_verified",
            Value: "true",
          },
          {
            Name: "email",
            Value: userToCreate.email,
          },
          {
            Name: "custom:apiKey",
            Value: userToCreate.apiKey || uuidv4().replace(/-/gi, ""), // Generate an API Key
          },
          {
            Name: "custom:access_academie",
            Value: userToCreate.accessAcademie,
          },
        ],
      };

      this.cognitoidentityserviceprovider.adminCreateUser(params, function(err) {
        if (err) logger.error(err, err.stack);
      });
    } catch (err) {
      logger.error(err);
    }
  }

  /**
   * Delete an AWS Cognito User
   * @param {*} userName
   */
  deleteCognitoUser(userName) {
    var params = {
      UserPoolId: config.aws.cognito.userPoolId /* required */,
      Username: userName /* required */,
    };

    this.cognitoidentityserviceprovider.adminDeleteUser(params, function(err) {
      if (err) logger.error(err, err.stack);
    });
  }

  /**
   * Update an AWS Cognito User
   * @param {*} userToUpdate
   */
  updateCognitoUser(userToUpdate) {
    try {
      var params = {
        UserAttributes: [
          {
            Name: "custom:access_all" /* required */,
            Value: userToUpdate.accessAll,
          },
          {
            Name: "email_verified",
            Value: "true",
          },
          {
            Name: "email",
            Value: userToUpdate.email,
          },
          {
            Name: "custom:apiKey",
            Value: userToUpdate.apiKey || uuidv4().replace(/-/gi, ""),
          },
          {
            Name: "custom:access_academie",
            Value: userToUpdate.accessAcademie,
          },
        ],
        UserPoolId: config.aws.cognito.userPoolId /* required */,
        Username: userToUpdate.userName /* required */,
      };

      this.cognitoidentityserviceprovider.adminUpdateUserAttributes(params, function(err) {
        if (err) logger.error(err, err.stack);
      });
    } catch (err) {
      logger.error(err);
    }
  }
}

const awsCognitoService = new AwsCognitoService();
module.exports = awsCognitoService;
