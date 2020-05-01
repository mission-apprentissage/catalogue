const { alias } = require("react-app-rewire-alias");

module.exports = function override(config, env) {
  alias({
    "@config": "../config",
  })(config);
  return config;
};
