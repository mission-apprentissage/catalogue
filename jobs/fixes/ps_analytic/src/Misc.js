const { getMefInfo, getCfdInfo } = require("./utils");
const FileManager = require("./FileManager");
const { asyncForEach } = require("../../../common-jobs/utils");
const { CloudFormation } = require("aws-sdk");
const Exporter = require("./Exporter");

const getRome = data => {
  if (data.length === 1) {
    return data[0].rome;
  } else {
    return data.reduce((acc, item) => {
      return acc + `${item.rome},`;
    }, []);
  }
};

async function getRNCPROMES() {
  const data = FileManager.getXLSXFile();
  const result = [];

  console.log("Données à traiter :", data.length);

  await asyncForEach(data, async item => {
    if (item.CODEMEF) {
      const mefInfo = await getMefInfo(item.CODEMEF.split(" ").join(""));
      if (mefInfo) {
        if (mefInfo.result.rncp.code_rncp) {
          item.CODE_RNCP = mefInfo.result.rncp.code_rncp;
          if (mefInfo.result.rncp.romes != null && mefInfo.result.rncp.romes.length > 0) {
            const t = getRome(mefInfo.result.rncp.romes);
            item.CODE_ROME = t;
          } else {
            item.CODE_ROME = "Erreur";
          }
        } else {
          item.CODE_RNCP = "Erreur";
        }
      }
    } else if (item.CODE_CFD) {
      const cfdInfo = await getCfdInfo(item.CODE_CFD);
      if (cfdInfo.result.rncp.code_rncp) {
        item.CODE_RNCP = cfdInfo.result.rncp.code_rncp;
        if (cfdInfo.result.rncp.romes != null && cfdInfo.result.rncp.romes.length > 0) {
          const t = getRome(cfdInfo.result.rncp.romes);
          item.CODE_ROME = t;
        } else {
          item.CODE_ROME = "Erreur";
        }
      }
    } else {
      item.STATUS = "Erreur";
    }
    result.push(item);
  });
  console.log("RESULTS", result.length);

  // await Exporter.toXlsx(result, "recoupement-rncp-romes.xlsx");
}

getRNCPROMES();
