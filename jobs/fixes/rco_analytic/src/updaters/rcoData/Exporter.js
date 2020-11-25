const XLSX = require("xlsx");
const path = require("path");

class Exporter {
  constructor() {}

  async toXlsx(jsonData, fileName) {
    const WS = XLSX.utils.json_to_sheet(jsonData, {
      header: [
        "etablissement_gestionnaire_siret",
        "etablissement_gestionnaire_adresse",
        "etablissement_gestionnaire_code_postal",
        "etablissement_gestionnaire_code_insee",
        "etablissement_formateur_siret",
        "etablissement_formateur_adresse",
        "etablissement_formateur_code_postal",
        "etablissement_formateur_code_insee",
        "etablissement_lieu_formation_adresse",
        "etablissement_lieu_formation_code_postal",
        "etablissement_lieu_formation_code_insee",
        "cfd",
        "rncp_code",
        "debut_sessions",
        "cdf_statut",
        "cfd_valeur",
        "rncp_statut",
        "rncp_valeur",
      ],
    });

    const workbook = XLSX.utils.book_new(); // Create a new blank workbook
    XLSX.utils.book_append_sheet(workbook, WS, "book"); // Add the worksheet to the workbook

    const writeFile = () =>
      new Promise(resolve => {
        XLSX.writeFileAsync(
          path.join(__dirname, `../../../${fileName}`),
          workbook,
          //{ bookType: "xlsx", type: "binary" },
          e => {
            if (e) {
              console.log(e);
            }
            resolve();
          }
        );
      });

    await writeFile();
  }
}

module.exports = Exporter;
