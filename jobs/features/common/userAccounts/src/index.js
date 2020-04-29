// #region Imports

const logger = require("../../../../common/Logger").mainLogger;
const asyncForEach = require("../../../../common/utils").asyncForEach;

const awsCognitoService = require("../../../../common/awsCognitoService");
const apiEsSup = require("../../../../common/EsSupApi");
const fileManager = require("./services/FileManager");

// #endregion

const run = async () => {
  try {
    const pamUsersToAdd = fileManager.getDataFromFile().filter(item => item.AJOUTE.toLowerCase() === "non");
    await createPamUsers(pamUsersToAdd);
  } catch (err) {
    logger.error(err);
  }
};

const createPamUsers = async usersToAdd => {
  logger.info(" -- Start Creating Catalog User Accounts -- ");

  await asyncForEach(usersToAdd, async userToAdd => {
    const numAcademie = userToAdd.ACADEMIE
      ? await apiEsSup.getNumAcademieInfoFromNomAcademie(userToAdd.ACADEMIE)
      : "-1";

    const userToCreate = {
      userName: userToAdd.MAIL.trim()
        .toLowerCase()
        .substr(0, userToAdd.MAIL.indexOf("@")),
      email: userToAdd.MAIL.trim().toLowerCase(),
      accessAll: "false",
      accessAcademie: `${numAcademie}`, // Todo : handle multi numAcademie
    };

    awsCognitoService.createCognitoUser(userToCreate);
    logger.info(`User ${userToCreate.userName} created !`);
  });

  logger.info(" -- End Creating Catalog User Accounts -- ");
};

const deleteUsers = async usersToDelete => {
  logger.info(" -- Start Deleting Catalog User Accounts -- ");

  await asyncForEach(usersToDelete, userToDelete => {
    awsCognitoService.deleteCognitoUser(userToDelete);
    logger.info(`User ${userToDelete.userName} deleted !`);
  });

  logger.info(" -- End Deleting Catalog User Accounts -- ");
};

const updateUsers = async usersToUpdate => {
  logger.info(" -- Start Updating Catalog User Accounts -- ");

  await asyncForEach(usersToUpdate, userToUpdate => {
    awsCognitoService.updateCognitoUser(userToUpdate);
    logger.info(`User ${userToUpdate.userName} updated !`);
  });

  logger.info(" -- End Updating Catalog User Accounts -- ");
};

run();
