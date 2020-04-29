const fs = require("fs");
const _ = require("lodash");
const { Transform } = require("stream");
const { LineStream } = require("byline");
const logger = require("../../../../common/Logger").mainLogger;
const util = require("util");
const xml2js = require("xml2js");
const {
  pipeline,
  transformObject,
  accumulate,
  ignoreEmpty,
  decodeStream,
} = require("../../../../common/script/streamUtils");

const xmlToJson = util.promisify(
  new xml2js.Parser({
    explicitArray: false,
    explicitRoot: false,
  }).parseString
);

const convertXmlIntoJson = async xml => {
  let regroupTagsWithMultipleOccurences = value => {
    if (value && typeof value === "object") {
      Object.keys(value).forEach(key => {
        if (["CERTIFICATEURS", "PARTENAIRES", "CODES_ROME"].includes(key)) {
          let nestedFieldName = Object.keys(value[key])[0];
          let nestedElement = value[key][nestedFieldName];
          value[key] = nestedElement.constructor !== Array ? [nestedElement] : nestedElement;
        }
      });
    }
  };

  let json = await xmlToJson(xml);

  let data = _.cloneDeepWith(json, regroupTagsWithMultipleOccurences);
  return _.pick(data, [
    "NUMERO_FICHE",
    "CERTIFICATEURS",
    "CODES_ROME",
    "PARTENAIRES",
    "TYPE_ENREGISTREMENT",
    "SI_JURY_CA",
  ]);
};

module.exports = async fichesFile => {
  let xml = "";
  let partial = true;
  let fiches = [];
  let stats = {
    errors: 0,
    total: 0,
  };

  await pipeline(
    fs.createReadStream(fichesFile),
    decodeStream("UTF-8"),
    new LineStream(),
    new Transform({
      objectMode: true,
      transform: function(chunk, encoding, callback) {
        try {
          let line = chunk.trim();

          if (line.startsWith("<FICHE>")) {
            xml = line;
          } else {
            xml += line;
          }

          if (line.startsWith("</FICHE>")) {
            partial = false;
          }

          if (!partial) {
            this.push(xml);
            partial = true;
            xml = "";
          }
          callback();
        } catch (e) {
          callback(e);
        }
      },
    }),
    transformObject(async xml => {
      try {
        let json = await convertXmlIntoJson(xml);
        stats.total++;
        return json;
      } catch (e) {
        logger.warn(`Unable to load fiche from xml due to ${e.message}`);
        stats.errors++;
        return {};
      }
    }),
    ignoreEmpty(),
    accumulate(fiches)
  );

  return { fiches, stats };
};
