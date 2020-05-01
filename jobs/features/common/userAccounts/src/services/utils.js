const getUserNameFromMail = userMail => {
  return userMail
    .trim()
    .toLowerCase()
    .substr(0, userMail.indexOf("@"));
};
module.exports.getUserNameFromMail = getUserNameFromMail;

const getAwsUserFrom = user => {
  const user = {
    userName: userName,
    email: userToAdd.MAIL.trim().toLowerCase(),
    accessAll: userToAdd.ACCES.trim().toLowerCase() === userAccess.
      ? userToAdd.ACCES_COMPLET.trim().toLowerCase() === "oui"
        ? "true"
        : "false"
      : "false",
    accessAcademie: `${user.a await getNumAcademieListFromEsSup(userToAdd.ACADEMIE)}`,
  };
  return user
};
module.exports.getUserNameFromMail = getUserNameFromMail;
