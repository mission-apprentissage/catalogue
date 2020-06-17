const { alias } = require("react-app-rewire-alias");

module.exports = function override(config, env) {
  alias({
    "@config": "../config",
    "@trainingSchema": "../common/models/trainingSchema",
  })(config);
  return config;
};
