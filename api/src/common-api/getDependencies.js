/* eslint-disable global-require */
/* eslint-disable import/no-unresolved */

let mongo = null;
let model = null;
if (process.env.STAGE === "local") {
  mongo = require("../../../common/mongo");
  model = require("../../../common/models2");
} else {
  mongo = require("../../common/mongo");
  model = require("../../common/models2");
}

module.exports = {
  mongo,
  model,
};
