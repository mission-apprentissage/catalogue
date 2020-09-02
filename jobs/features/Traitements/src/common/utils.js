const fs = require("fs-extra");
const axios = require("axios");

const waitFor = ms => new Promise(r => setTimeout(r, ms));
module.exports.waitFor = waitFor;

const asyncForEach = async (array, callback) => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
};
module.exports.asyncForEach = asyncForEach;

const downloadFile = async (url, to) => {
  const writer = fs.createWriteStream(to);

  const response = await axios({
    url,
    method: "GET",
    responseType: "stream",
  });

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
};
module.exports.downloadFile = downloadFile;
