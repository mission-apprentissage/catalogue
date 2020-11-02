const fs = require("fs-extra");
const path = require("path");
const find = require("lodash").find;

const isValidCodePostal = codePostal => {
  return /^[0-9]{5}$/g.test(codePostal);
};

module.exports.isValidCodePostal = isValidCodePostal;

let baseCodePostaux = [];
const zipCodeExist = search => {
  if (baseCodePostaux.length === 0) {
    baseCodePostaux = fs.readJsonSync(path.join(__dirname, "../assets/base-officielle-des-codes-postaux.json"));
  }
  return find(baseCodePostaux, search);
};

module.exports.zipCodeExist = zipCodeExist;
