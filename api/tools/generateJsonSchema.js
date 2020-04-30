const fs = require("fs");
const mongoose = require("mongoose");
// eslint-disable-next-line import/no-extraneous-dependencies
require("mongoose-schema-jsonschema")(mongoose);
const { establishmentSchema, formationSchema } = require("../../common/models");

const { Schema } = mongoose;

// Should not be use, issue https://github.com/deliveryhero/serverless-aws-documentation/blob/master/src/models.js#L9
const replaceNullDefault = schem => {
  const obj = { ...schem };
  // eslint-disable-next-line no-restricted-syntax
  for (const key of Object.keys(obj)) {
    // eslint-disable-next-line no-prototype-builtins
    if (obj[key].hasOwnProperty("default") && obj[key].default === null) {
      obj[key].default = "null";
    }
  }
  return obj;
};

const eSchema = new Schema(replaceNullDefault(establishmentSchema));
const eJsonSchema = eSchema.jsonSchema();
const edata = JSON.stringify(eJsonSchema, null, 2);
fs.writeFileSync("establishmentSchema.json", edata);

const fSchema = new Schema(replaceNullDefault(formationSchema));
const fJsonSchema = fSchema.jsonSchema();
const fdata = JSON.stringify(fJsonSchema, null, 2);
fs.writeFileSync("formationSchema.json", fdata);
