import { Client } from "@elastic/elasticsearch";
import { AmazonConnection } from "aws-elasticsearch-connector";
import mongoosasticHandler from "./mongoosastic";
import config from "../../config";

const { STAGE } = process.env;

const localOptions = { node: `http://${config.es.endpoint}` };
const awsOptions = {
  node: `https://${config.es.endpoint}`,
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

export const getElasticInstance = () => es;
export const mongoosastic = mongoosasticHandler;
