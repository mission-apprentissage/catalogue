const path = require("path");

module.exports = fileName => {
  return path.join(__dirname, fileName);
};
