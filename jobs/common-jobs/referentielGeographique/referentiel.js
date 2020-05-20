const { pipeline, writeObject } = require("../../../common/streamUtils");
const parseCSV = require("csv-parse");
const titleCase = require("title-case").titleCase;

module.exports = () => {
  let referentiel = [];

  return {
    loadCsvFile: async inputStream => {
      await pipeline(
        inputStream,
        parseCSV({
          delimiter: ";",
          skip_lines_with_error: true,
          skip_empty_lines: true,
          from_line: 2,
          columns: [
            "REGRGP_NOM",
            "REG_NOM",
            "REG_NOM_OLD",
            "ACA_NOM",
            "DEP_NOM",
            "COM_CODE",
            "COM_CODE1",
            "COM_CODE2",
            "COM_ID",
            "COM_NOM_MAJ_COURT",
            "COM_NOM_MAJ",
            "COM_NOM",
            "UU_CODE",
            "UU_ID",
            "UUCR_ID",
            "UUCR_NOM",
            "ZE_ID",
            "DEP_CODE",
            "DEP_ID",
            "DEP_NOM_NUM",
            "DEP_NUM_NOM",
            "ACA_CODE",
            "ACA_ID",
            "REG_CODE",
            "REG_ID",
            "REG_CODE_OLD",
            "REG_ID_OLD",
            "FD_ID",
            "FR_ID",
            "FE_ID",
            "UU_ID_99",
            "AU_CODE",
            "AU_ID",
            "AUC_ID",
            "AUC_NOM",
            "geolocalisation",
          ],
        }),
        writeObject(line => {
          referentiel.push({
            aca_nom: line["ACA_NOM"],
            aca_code: line["ACA_CODE"],
            com_code: line["COM_CODE"],
            dep_code: line["DEP_CODE"],
          });
        })
      );
    },
    getAcaCodeFromNomAca: nomAcademie => {
      const nomAcademieFormatted = titleCase(nomAcademie.toLowerCase());
      let res = referentiel.find(d => d.aca_nom === nomAcademieFormatted);
      return res ? Number.parseInt(res.aca_code) : null;
    },
    getAcaNomFromNumAca: numAcademie => {
      const numAcademieFormatted = Number.parseInt(numAcademie).toLocaleString("fr-FR", { minimumIntegerDigits: 2 });
      let res = referentiel.find(d => d.aca_code === numAcademieFormatted);
      return res ? res.aca_nom : null;
    },
    getAcaCodeFromNumDep: numDepartement => {
      let res = referentiel.find(d => d.dep_code === numDepartement);
      return res ? Number.parseInt(res.aca_code) : null;
    },
    getAcaNomFromNumDep: numDepartement => {
      let res = referentiel.find(d => d.dep_code === numDepartement);
      return res ? res.aca_nom : null;
    },
    getAcaCodeFromComCode: codeCommune => {
      let res = referentiel.find(d => d.com_code === codeCommune);
      return res ? Number.parseInt(res.aca_code) : null;
    },
    getRef: () => referentiel,
  };
};
