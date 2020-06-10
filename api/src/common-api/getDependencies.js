/* eslint-disable global-require */
/* eslint-disable import/no-unresolved */

let mongo = null;
let model = null;
let mongoosasticHandler = null;
if (process.env.STAGE === "local") {
  mongo = require("../../../common/mongo");
  model = require("../../../common/models2");
  mongoosasticHandler = require("../../../common/esClient/mongoosastic");
} else {
  mongo = require("../../common/mongo");
  model = require("../../common/models2");
  mongoosasticHandler = require("../../common/esClient/mongoosastic");
}

module.exports = {
  mongo,
  model,
  mongoosasticHandler,
};
