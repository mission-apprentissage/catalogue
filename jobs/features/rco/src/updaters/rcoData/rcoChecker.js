// #region Imports

const { infosCodes, PATH_RCO_EXPORT } = require("./Constants");
// const { filter, find } = require("lodash");
const fileManager = require("./FileManager");

// #endregion

class RcoChecker {
  constructor() {
    this.baseFormation = fileManager.getDataRcoFromFile(PATH_RCO_EXPORT);
  }

  getUpdates() {}
}

const rcoChecker = new RcoChecker();
module.exports = rcoChecker;
