const catalogue = require("./assets/formations_catalogue.json");

const matching = (matchType, ligne, dataset) => {
  const uai = catalogue =>
    catalogue.uai_formation === ligne.UAI_GES ||
    catalogue.uai_formation === ligne.UAI_COMPOSANTE ||
    catalogue.uai_formation === ligne.UAI_AFF ||
    catalogue.etablissement_formateur_uai === ligne.UAI_GES ||
    catalogue.etablissement_formateur_uai === ligne.UAI_COMPOSANTE ||
    catalogue.etablissement_formateur_uai === ligne.UAI_AFF ||
    catalogue.etablissement_responsable_uai === ligne.UAI_GES ||
    catalogue.etablissement_responsable_uai === ligne.UAI_COMPOSANTE ||
    catalogue.etablissement_responsable_uai === ligne.UAI_AFF;

  const codePostal = catalogue =>
    catalogue.etablissement_responsable_code_postal === ligne.CODEPOSTAL || catalogue.code_postal === ligne.CODEPOSTAL;

  const codeInsee = catalogue => catalogue.code_commune_insee === ligne.CODECOMMUNE;

  const academie = catalogue => catalogue.nom_academie === ligne.ACADEMIE;

  const duo1 = catalogue =>
    catalogue.educ_nat_code === ligne.cfd_valeur && catalogue.num_departement === ligne.CODEPOSTAL.substring(0, 2);

  const duo2 = catalogue =>
    catalogue.educ_nat_code === ligne.CODECFD2 && catalogue.num_departement === ligne.CODEPOSTAL.substring(0, 2);

  const duo3 = catalogue =>
    catalogue.educ_nat_code === ligne.CODECFD3 && catalogue.num_departement === ligne.CODEPOSTAL.substring(0, 2);

  const mef = catalogue => catalogue.mef_10_code === ligne.CODEMEF;

  const filter = (condition, dataset) => {
    // console.log("in filter", dataset.length);
    const res = (dataset || catalogue).filter(condition);
    // console.log("filtered", res.length);
    return res;
  };

  switch (matchType) {
    case "UAI":
      return filter(uai, catalogue);
      break;
    case "DUO1":
      return filter(duo1, dataset);
      break;
    case "DUO2":
      return filter(duo2);
      break;
    case "DUO3":
      return filter(duo3);
      break;
    case "INSEE":
      return filter(codeInsee, dataset);
      break;
    case "CODE_POSTAL":
      return filter(codePostal, dataset);
      break;
    case "ACADEMIE":
      return filter(academie, dataset);
      break;
    case "MEF":
      return filter(mef, dataset);
      break;
    default:
      break;
  }
};

const response = (data, result, options) => {
  data.MNA_STATUS = options.statut;
  data.MNA_MATCHING_TYPE = options.type;
  data.MNA_MATCHING_STEP = options.step;
  data.MNA_MATCHING_CASE = options.match;
  data.etablissement_nom = result.etablissement_responsable_enseigne;
  data.etablissement_raison_social = result.etablissement_responsable_entreprise_raison_sociale;
  data.etablissement_adresse_postal = result.etablissement_responsable_adresse;
  data.etablissement_responsable_code_postal = result.etablissement_responsable_code_postal;
  data.etablissement_responsable_localite = result.etablissement_responsable_localite;
  data.code_commune_insee = result.code_commune_insee;
  data.etablissement_responsable_siret = result.etablissement_responsable_siret;
  data.etablissement_geoloc = result.geo_coordonnees_etablissement_responsable;
  data.etablissement_responsable_uai = result.etablissement_responsable_uai;
  data.etablissement_formateur_uai = result.etablissement_formateur_uai;
  data.uai_formation = result.uai_formation;
  return data;
};

function trail(data) {
  const matchUAI1 = matching("UAI", data);
  console.log("match UAI", matchUAI1.length);
  if (matchUAI1.length > 0) {
    if (matchUAI1.length === 1) {
      return response(data, matchUAI1[0], { status: "Trouvé (UAI)", type: "6*", step: 1, match: "UAI" });
    }
    if (matchUAI1.length === 2) {
      const match = matchUAI1.filter(x => x.mef_10_code === data.CODEMEF);
      if (match.length === 1) {
        return response(data, matchUAI1[0], { status: "Trouvé (UAI, MEF)", type: "6*", step: 1, match: "UAI" });
      }
    }
    const matchUAI2 = matching("DUO1", data, matchUAI1);
    console.log("match cfd & dept", matchUAI2.length);
    if (matchUAI2.length > 0) {
      if (matchUAI2.length === 1) {
        return response(data, matchUAI2[0], { status: "Trouvé (UAI, CFD, MEF)", type: "6*", step: 2, match: "UAI" });
      }
      if (matchUAI2.length === 2) {
        const match = matchUAI2.filter(x => x.mef_10_code === data.CODEMEF);
        if (match.length === 1) {
          return response(data, matchUAI2[0], { status: "Trouvé (UAI, CFD, MEF)", type: "6*", step: 2, match: "UAI" });
        }
      }
      const matchUAI3 = matching("INSEE", data, matchUAI2);
      console.log("match insee", matchUAI3.length);
      if (matchUAI3.length > 0) {
        const matchUAI4 = matching("CODE_POSTAL", data, matchUAI3);
        console.log("match cp", matchUAI4.length);
        if (matchUAI4.length > 0) {
          const matchUAI5 = matching("ACADEMIE", data, matchUAI4);
          console.log("match academie", matchUAI5.length);
          if (matchUAI5.length > 0) {
            const matchUAI6 = matching("MEF", data, matchUAI5);
            if (matchUAI6.length > 0) {
              const match = matchUAI6[0];
              console.log(match);
              console.log("———————————————");
              console.log("MATCH MEF", matchUAI6.length);
              console.log("———————————————");
              data.catalogue_MNA_statut = "Trouvé (UAI, MEF, ACADEMIE, CP, INSEE, CFD)";
              data.catalogue_MNA_match_type = 6;
              data.catalogue_MNA_match_case = "UAI";
              data.etablissement_nom = match.etablissement_nom;
              data.etablissement_raison_social = match.etablissement_raison_social;
              data.etablissement_adresse_postal = match.etablissement_adresse_postal;
              data.code_commune_insee = match.code_commune_insee;
              data.siret = match.siret;
              data.etablissement_geoloc = match.geo_coordonnees_etablissement_responsable;
              data.etablissement_responsable_uai = match.etablissement_responsable_uai;
              data.etablissement_formateur_uai = match.etablissement_formateur_uai;
              data.uai_formation = match.uai_formation;
              return data;
            } else {
              return "match uai cfd dept insee cp academie";
            }
          } else {
            return "match uai cfd dept insee cp";
          }
        } else {
          return "match uai cfd dept insee";
        }
      } else {
        return "match uai cfd dept";
      }
    } else {
      return "match uai";
    }
  } else {
    return "cartouche";
  }
}

function matcher(data) {
  if (matching("UAI", data)) {
    console.log("matched uai");
    if (matching("DUO1", data)) {
      console.log("matched cfd & dept");
      if (matching("INSEE", data)) {
        console.log("matched insee");
        if (matching("CODE_POSTAL", data)) {
          console.log("matched cp");
          if (matching("ACADEMIE", data)) {
            console.log("matched academie");
            if (matching("MEF", data)) {
              console.log("matched mef");

              data.catalogue_MNA_statut = "Trouvé (UAI, MEF, ACADEMIE, CP, INSEE, CFD)";
              data.catalogue_MNA_match_type = 6;
              data.catalogue_MNA_match_case = "UAI";
              return data;
            } else {
              console.log("not matched MEF");

              data.catalogue_MNA_statut = "Trouvé (UAI, ACADEMIE, CP, INSEE, CFD)";
              data.catalogue_MNA_match_type = 5;
              data.catalogue_MNA_match_case = "UAI";
              return data;
            }
          } else {
            console.log("not matched ACADEMIE");

            data.catalogue_MNA_statut = "Trouvé (UAI, CP, INSEE, CFD)";
            data.catalogue_MNA_match_type = 4;
            data.catalogue_MNA_match_case = "UAI";
            return data;
          }
        } else {
          console.log("not matched CP");

          data.catalogue_MNA_statut = "Trouvé (UAI, INSEE, CFD)";
          data.catalogue_MNA_match_type = 3;
          data.catalogue_MNA_match_case = "UAI";
          return data;
        }
      } else {
        console.log("not matched INSEE");

        data.catalogue_MNA_statut = "Trouvé (UAI, CFD)";
        data.catalogue_MNA_match_type = 2;
        data.catalogue_MNA_match_case = "UAI";
        return data;
      }
    } else {
      console.log("not matched DUO");

      data.catalogue_MNA_statut = "Trouvé (UAI)";
      data.catalogue_MNA_match_type = 1;
      data.catalogue_MNA_match_case = "UAI";
      return data;
    }
  } else {
    console.log("COUCOU CFD");
    if (MATCHING_CFD) {
      if (MATCH_DEPT) {
        if (MATCH_INSEE) {
          if (MATCH_CODE_POSTAL) {
            if (MATCH_ACADEMIE) {
              if (MATCH_MEF) {
                data.catalogue_MNA_statut = "Trouvé (CFD, DEPT, INSEE, CP, ACADEMIE, MEF)";
                data.catalogue_MNA_match_type = 6;
                data.catalogue_MNA_match_case = "CFD";
                return data;
              } else {
                data.catalogue_MNA_statut = "Trouvé (CFD, DEPT, INSEE, CP, ACADEMIE)";
                data.catalogue_MNA_match_type = 5;
                data.catalogue_MNA_match_case = "CFD";
                return data;
              }
            } else {
              data.catalogue_MNA_statut = "Trouvé (CFD, DEPT, INSEE, CP)";
              data.catalogue_MNA_match_type = 4;
              data.catalogue_MNA_match_case = "CFD";
              return data;
            }
          } else {
            data.catalogue_MNA_statut = "Trouvé (CFD, DEPT, INSEE)";
            data.catalogue_MNA_match_type = 3;
            data.catalogue_MNA_match_case = "CFD";
            return data;
          }
        } else {
          data.catalogue_MNA_statut = "Trouvé (CFD, DEPT)";
          data.catalogue_MNA_match_type = 2;
          data.catalogue_MNA_match_case = "CFD";
          return data;
        }
      } else {
        data.catalogue_MNA_statut = "Trouvé (CFD)";
        data.catalogue_MNA_match_type = 1;
        data.catalogue_MNA_match_case = "CFD";
        return data;
      }
    } else {
      if (MATCH_DEPT) {
        console.log("COUCOU");
        if (MATCH_INSEE) {
          if (MATCH_CODE_POSTAL) {
            if (MATCH_ACADEMIE) {
              if (MATCH_MEF) {
                ("MATCHING_5*");
                data.catalogue_MNA_statut = "Trouvé (DEPT, INSEE, CP, ACADEMIE, MEF)";
                data.catalogue_MNA_match_type = 5;
                data.catalogue_MNA_match_case = "AUCUN";
                return data;
              } else {
                data.catalogue_MNA_statut = "Trouvé (DEPT, INSEE, CP, ACADEMIE)";
                data.catalogue_MNA_match_type = 4;
                data.catalogue_MNA_match_case = "AUCUN";
                return data;
              }
            } else {
              data.catalogue_MNA_statut = "Trouvé (DEPT, INSEE, CP)";
              data.catalogue_MNA_match_type = 3;
              data.catalogue_MNA_match_case = "AUCUN";
              return data;
            }
          } else {
            data.catalogue_MNA_statut = "Trouvé (DEPT, INSEE)";
            data.catalogue_MNA_match_type = 2;
            data.catalogue_MNA_match_case = "AUCUN";
            return data;
          }
        } else {
          data.catalogue_MNA_statut = "Trouvé (DEPT)";
          data.catalogue_MNA_match_type = 1;
          data.catalogue_MNA_match_case = "AUCUN";
          return data;
        }
      } else {
        data.catalogue_MNA_statut = "Aucun match";
        data.catalogue_MNA_match_type = 0;
        data.catalogue_MNA_match_case = "AUCUN";
        return data;
      }
    }
  }
}
module.exports = { matcher, trail };
