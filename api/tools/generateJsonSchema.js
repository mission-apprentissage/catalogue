const fs = require("fs");
const mongoose = require("mongoose");
// eslint-disable-next-line import/no-extraneous-dependencies
require("mongoose-schema-jsonschema")(mongoose);
const establishmentSchema = require("../src/models/establishmentSchema");
const formationSchema = require("../src/models/formationSchema");

const { Schema } = mongoose;

const eSchema = new Schema(establishmentSchema);
const eJsonSchema = eSchema.jsonSchema();
const edata = JSON.stringify(eJsonSchema, null, 2);
fs.writeFileSync("establishmentSchema.json", edata);

const fSchema = new Schema(formationSchema);
const fJsonSchema = fSchema.jsonSchema();
const fdata = JSON.stringify(fJsonSchema, null, 2);
fs.writeFileSync("formationSchema.json", fdata);
