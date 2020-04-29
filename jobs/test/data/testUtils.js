const uuid = require("uuid");

module.exports = {
  randomize: value => `${value}-${uuid.v4()}`,
  randomSIRET: () => `${Math.floor(Math.random() * 9000000000) + 1000000000}`,
};
