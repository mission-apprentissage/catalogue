const { alias } = require("react-app-rewire-alias");

module.exports = function override(config, env) {
  alias({
    "@config": "../config-merge",
  })(config);
  return config;
};
