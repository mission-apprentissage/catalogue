// #region Imports

const logger = require("./Logger").mainLogger;
const AWS = require("aws-sdk");

// #endregion

// Cognito Default Values
const { config } = require("./config");

const defaultPassword = "1MotDePassTemporaire!";
const customApiKey = "XXXX";

class AwsCognitoService {
  constructor() {
    AWS.config.region = config.aws.cognito.region;
    this.cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider();
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
            Value: customApiKey,
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
            Value: customApiKey,
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
