import { Client } from "@elastic/elasticsearch";
import { AmazonConnection } from "aws-elasticsearch-connector";
import mongoosasticHandler from "./mongoosastic";
import { config } from "../../../../config-merge";

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

export const getElasticInstance = () => es;
export const mongoosastic = mongoosasticHandler;
