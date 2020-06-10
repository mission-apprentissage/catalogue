/* eslint-disable global-require */
/* eslint-disable import/no-unresolved */

let mongo = null;
let model = null;
let mongoosasticHandler = null;
let config = null;
if (process.env.STAGE === "local") {
  mongo = require("../../../common/mongo");
  model = require("../../../common/models2");
  mongoosasticHandler = require("../../../common/esClient/mongoosastic");
  config = require("../../../config").config;
} else {
  mongo = require("../../common/mongo");
  model = require("../../common/models2");
  mongoosasticHandler = require("../../common/esClient/mongoosastic");
  config = require("../../config").config;
}

module.exports = {
  mongo,
  model,
  mongoosasticHandler,
  config,
};
