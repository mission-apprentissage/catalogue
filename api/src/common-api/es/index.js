const { Client } = require("@elastic/elasticsearch");
const { AmazonConnection } = require("aws-elasticsearch-connector");
const { mongoosasticHandler, config } = require("../getDependencies");

const { STAGE } = process.env;

const localOptions = { node: `http://${config.aws.elasticsearch.endpoint}` };
const awsOptions = {
  node: `https://${config.aws.elasticsearch.endpoint}`,
  Connection: AmazonConnection,
  awsConfig: {
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  },
};
const es = new Client({
  ...(STAGE !== "local" ? awsOptions : localOptions),
});

const getElasticInstance = () => es;
const mongoosastic = mongoosasticHandler;

module.exports = {
  getElasticInstance,
  mongoosastic,
};
