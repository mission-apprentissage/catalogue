// #region Imports

const logger = require("../../../../common/Logger").mainLogger;
const asyncForEach = require("../../../../common/utils").asyncForEach;

const awsCognitoService = require("../../../../common/awsCognitoService");
const apiEsSup = require("../../../../common/EsSupApi");
const fileManager = require("./services/FileManager");
const getUserNameFromMail = require("./services/utils").getUserNameFromMail;
const { userStatuts, userAccess } = require("./services/constants");

// #endregion

const run = async () => {
  try {
    const pamUsers = fileManager.getDataFromFile();

    // Add users PAM
    const pamUsersToAdd = pamUsers
      ? pamUsers.filter(item => item.ACTION && item.ACTION.toLowerCase() === userStatuts.toAdd)
      : [];
    await createPamUsers(pamUsersToAdd);

    // Delete users PAM
    const pamUsersToRemove = pamUsers
      ? pamUsers.filter(item => item.ACTION && item.ACTION.toLowerCase() === userStatuts.toRemove)
      : [];
    await deleteUsers(pamUsersToRemove);

    // Update users PAM
    const pamUsersToUpdate = pamUsers
      ? pamUsers.filter(item => item.ACTION && item.ACTION.toLowerCase() === userStatuts.toUpdate)
      : [];
    await updateUsers(pamUsersToUpdate);
  } catch (err) {
    logger.error(err);
  }
};

const createPamUsers = async usersToAdd => {
  logger.info(" -- Start Creating Catalog User Accounts -- ");

  await asyncForEach(usersToAdd, async userToAdd => {
    const userName = getUserNameFromMail(userToAdd.MAIL);
    const user = {
      userName: userName,
      email: userToAdd.MAIL.trim().toLowerCase(),
      accessAll: userToAdd.ACCES.trim().toLowerCase() === userAccess.full
        ? userToAdd.ACCES_COMPLET.trim().toLowerCase() === "oui"
          ? "true"
          : "false"
        : "false",
      accessAcademie: `${user.a await getNumAcademieListFromEsSup(userToAdd.ACADEMIE)}`,
    };

    if (!awsCognitoService.getCognitoUser(userName)) {
      // awsCognitoService.createCognitoUser(user);
      logger.info(`User ${userName} created !`);
    } else {
      logger.info(`User ${userName} already exist !`);
    }
  });

  logger.info(" -- End Creating Catalog User Accounts -- ");
};

const deleteUsers = async usersToDelete => {
  logger.info(" -- Start Deleting Catalog User Accounts -- ");

  await asyncForEach(usersToDelete, userToDelete => {
    const userName = getUserNameFromMail(userToDelete.MAIL);
    if (awsCognitoService.getCognitoUser(userName)) {
      // awsCognitoService.deleteCognitoUser(userToDelete);
      logger.info(`User ${userName} deleted !`);
    } else {
      logger.info(`User ${userName} not found !`);
    }
  });

  logger.info(" -- End Deleting Catalog User Accounts -- ");
};

const updateUsers = async usersToUpdate => {
  logger.info(" -- Start Updating Catalog User Accounts -- ");

  await asyncForEach(usersToUpdate, userToUpdate => {
    if (awsCognitoService.getCognitoUser(userToUpdate.userName)) {
      // awsCognitoService.updateCognitoUser(userToUpdate);
      logger.info(`User ${userToUpdate.userName} updated !`);
    } else {
      logger.info(`User ${userToUpdate.userName} not found !`);
    }
  });

  logger.info(" -- End Updating Catalog User Accounts -- ");
};

const getNumAcademieListFromEsSup = async academiesList => {
  if (!academiesList) {
    return "-1";
  }

  const numAcademiesList = new Array();
  await asyncForEach(academiesList.split(","), async academie => {
    numAcademiesList.push(await apiEsSup.getNumAcademieInfoFromNomAcademie(academie));
  });
  return numAcademiesList;
};

run();
