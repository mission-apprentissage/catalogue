const { Client } = require("@elastic/elasticsearch");
const { AmazonConnection } = require("aws-elasticsearch-connector");

const ENV = "dev"; // "prod"
const new_endpoint_es =
  ENV === "dev"
    ? "search-mna-es-dev-4p4det7qgnd7fp7k77kon32gwi.eu-west-3.es.amazonaws.com"
    : "search-mna-es-prod-uvteou2uz65vgfcijxw74p4al4.eu-west-3.es.amazonaws.com";

const options = {
  node: `https://${new_endpoint_es}`,
  Connection: AmazonConnection,
  awsConfig: {
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  },
};
const es = new Client(options);

const getElasticInstance = () => es;
module.exports = {
  getElasticInstance,
};
