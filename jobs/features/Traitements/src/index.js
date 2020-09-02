const { getDataFromCfd } = require("./handlers/cfdHandler");
const { getDataFromMef10 } = require("./handlers/mefHandler");
const { getDataFromCP, getCoordaniteFromAdresseData } = require("./handlers/geoHandler");
const { getDataFromRncp } = require("./handlers/rncpHandler");
const { getDataFromSiret } = require("./handlers/siretHandler");

const { downloadBcnTables } = require("./jobs/bcnJob");

const run = async (
  options = {
    mode: "cfd_info",
    value: "XXXX",
  }
) => {
  try {
    if (options.mode === "cfd_info") {
      const r = await getDataFromCfd(options.value);
      console.log(r);
      console.log(r.result.mefs.mefs10);
      return r;
    } else if (options.mode === "mef_info") {
      const r = await getDataFromMef10(options.value);
      console.log(r);
      return r;
    } else if (options.mode === "cp_info") {
      const r = await getDataFromCP(options.value);
      console.log(r);
      return r;
    } else if (options.mode === "coordinate_info") {
      const r = await getCoordaniteFromAdresseData(options.value);
      console.log(r);
      return r;
    } else if (options.mode === "rncp_info") {
      const r = await getDataFromRncp(options.value);
      console.log(r.result.romes);
      console.log(r);
      return r;
    } else if (options.mode === "siret_info") {
      const r = await getDataFromSiret(options.value);
      console.log(r);
      return r;
    } else if (options.mode === "bnc_job") {
      const r = await downloadBcnTables();
      return r;
    }
  } catch (error) {
    console.log(error);
    return {
      result: {},
      messages: {
        error: error.message,
      },
    };
  }
};

module.exports.run = run;

// run({
//   mode: "cfd_info",
//   value: "26033206",
// });
// run({
//   mode: "cfd_info",
//   value: "50022135",
// });
// run({
//   mode: "mef_info",
//   value: "4173320611",
// });
// run({
//   mode: "rncp_info",
//   value: "RNCP7571", // RNCP24435 RNCP24440
// });
// run({
//   mode: "rncp_info",
//   value: "RNCP13877",
// });
// run({
//   mode: "cp_info",
//   value: "92600",
// });
// run({
//   mode: "coordinate_info",
//   value: {
//     numero_voie: "4",
//     type_voie: "rue",
//     nom_voie: "Pierre Durand",
//     code_postal: "92600",
//     localite: "Asnières-sur-Seine",
//   },
// });

// run({
//   mode: "siret_info",
//   value: "32922456200234", // 32922456200630
// });

// run({
//   mode: "bnc_job",
// });
