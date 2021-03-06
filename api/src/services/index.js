/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */
const { success, failure, notFound } = require("../common-api/response");

const basePath = process.env.STAGE === "local" ? "../../.." : "../..";

// function execShellCommand(cmd) {
//   const { exec } = require("child_process");
//   return new Promise(resolve => {
//     exec(cmd, (error, stdout, stderr) => {
//       if (error) {
//         console.warn(error);
//       }
//       resolve(stdout || stderr);
//     });
//   });
// }

module.exports.handler = async (event, context, callback) => {
  // eslint-disable-next-line no-param-reassign
  context.callbackWaitsForEmptyEventLoop = false;

  const qs = event.queryStringParameters || null;
  const job = qs && qs.job ? qs.job : "";
  const id = qs && qs.id ? qs.id : "";
  const mode = qs && qs.mode ? qs.mode : "";

  const result = {};
  try {
    switch (job) {
      case "etablissement":
        {
          if (id === "") {
            throw new Error("Something went wrong: id missing");
          }
          // eslint-disable-next-line no-case-declarations
          const {
            run,
          } = require(`${basePath}/jobs/features/etablissements/etablishmentsUpdater/src/etablishmentsUpdater`);
          await run({ _id: id });
        }
        break;
      case "formation-update":
        {
          if (id === "") {
            throw new Error("Something went wrong: id missing");
          }
          // console.log(await execShellCommand(`ls -l`));
          // eslint-disable-next-line no-case-declarations
          const { run } = require(`${basePath}/jobs/features/formations/trainingsUpdater/src/trainingsUpdater`);
          await run({ _id: id });
        }
        break;
      case "rncp":
        {
          if (id === "") {
            throw new Error("Something went wrong: id missing");
          }
          // eslint-disable-next-line no-case-declarations
          const {
            run,
            // eslint-disable-next-line global-require
          } = require(`${basePath}/jobs/features/rncp/src/index`);
          await run({ query: { _id: id } });
        }
        break;
      case "rncp-inverse":
        {
          if (id === "") {
            throw new Error("Something went wrong: id missing");
          }
          // eslint-disable-next-line no-case-declarations
          const {
            run,
            // eslint-disable-next-line global-require
          } = require(`${basePath}/jobs/features/rncpToCodeEn/src/index`);
          let options = { query: { _id: id } };
          if (mode === "findCodeEn" || mode === "findCodeRNCP") {
            options = {
              ...options,
              updateMode: mode === "findCodeEn" ? "updateCodeEnFromCodeRncp" : "updateCodeRncpFromCodeEn",
            };
          }
          await run(options);
        }
        break;
      case "onisep":
        {
          if (id === "") {
            throw new Error("Something went wrong: id missing");
          }
          // eslint-disable-next-line no-case-declarations
          const {
            run,
            // eslint-disable-next-line global-require
          } = require(`${basePath}/jobs/features/onisep/src/index`);
          await run({ query: { _id: id } });
        }
        break;
      case "":
      default:
        throw new Error("Job not found");
    }
    callback(
      null,
      success({
        ...result,
      })
    );
  } catch (error) {
    if (error.message === "Job not found") {
      callback(
        null,
        notFound({
          error: "Job not found",
        })
      );
    } else {
      console.log(error);
      callback(
        null,
        failure({
          error: error.message,
        })
      );
    }
  }
};
