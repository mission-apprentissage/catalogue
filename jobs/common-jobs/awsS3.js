// #region Imports

const AWS = require("aws-sdk");

const s3 = new AWS.S3();

module.exports = {
  getS3ObjectAsStream: key => {
    return s3.getObject({ Bucket: "mna-bucket", Key: key }).createReadStream();
  },
};
