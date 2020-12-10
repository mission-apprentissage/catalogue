const path = require("path");

const PATH_BASE_DATADOCK = path.join(__dirname, "../../../assets/BaseDataDock.xlsx");
// const PATH_DATAGOUV_OFS_FILE = path.join(__dirname, "../../../assets/20200227_public_ofs.csv");
const PATH_DATAGOUV_OFS_FILE = path.join(__dirname, "../../../assets/20201207_public_ofs.csv");
const PATH_LISTDEPP_FILE = path.join(__dirname, "../../../assets/CFASousConvRegionale_02122019.xlsx");
const PATH_LISTDGEFP_FILE = path.join(__dirname, "../../../assets/DGEFP - Extraction au 10 01 2020.xlsx");

module.exports = {
  PATH_BASE_DATADOCK,
  PATH_DATAGOUV_OFS_FILE,
  PATH_LISTDEPP_FILE,
  PATH_LISTDGEFP_FILE,
};
