const fcController = require("../controllers/fc/fcController");
const bcnController = require("../controllers/bcn/bcnController");

const getDataFromRncp = providedRncp => {
  if (!providedRncp || !/^(RNCP)?[0-9]{5}$/g.test(providedRncp.trim())) {
    return {
      result: {},
      messages: {
        error: "Le code RNCP doit être définit et au format 5 ou 9 caractères,  RNCP24440 ou 24440",
      },
    };
  }

  let rncp = `${providedRncp}`.trim();
  if (rncp.length === 5) rncp = `RNCP${rncp}`;

  const cfdUpdated = fcController.findCfdFromRncp(rncp);
  const infoRncpUpdated = fcController.findInfoFromRncp(rncp);
  const infoRncpCertificateurs = fcController.findCertificateursFromRncp(rncp);
  const nsfUpdated = fcController.findNsfFromRncp(rncp);
  const romesUpdated = fcController.findRomesFromRncp(rncp);
  const blocUpdated = fcController.findBlocCompetencesFromRncp(rncp);
  const voixAccesUpdated = fcController.findVoixAccesFromRncp(rncp);
  const cfdData = bcnController.getDataFromCfd(cfdUpdated.value);

  return {
    result: {
      code_rncp: rncp,
      intitule_diplome: infoRncpUpdated.value.intituleDiplome,
      date_fin_validite_enregistrement: infoRncpUpdated.value.date_fin_validite_enregistrement,
      active_inactive: infoRncpUpdated.value.ActiveInactive,
      etat_fiche_rncp: infoRncpUpdated.value.EtatFiche,
      niveau_europe: infoRncpUpdated.value.NiveauEurope,
      code_type_certif: infoRncpUpdated.value.CodeTypeCertif,
      type_certif: infoRncpUpdated.value.TypeCertif,
      ancienne_fiche: infoRncpUpdated.value.AncienneFiche,
      nouvelle_fiche: infoRncpUpdated.value.NouvelleFiche,
      demande: infoRncpUpdated.value.Demande,
      certificateurs: infoRncpCertificateurs.value,
      nsf_code: nsfUpdated.value.code,
      nsf_libelle: nsfUpdated.value.Libelle,
      romes: romesUpdated.value,
      blocs_competences: blocUpdated.value,
      voix_acces: voixAccesUpdated.value,
      cfd: {
        ...cfdData.result,
      },
    },
    messages: {
      code_rncp: cfdUpdated.info,
      rncp_info: infoRncpUpdated.info,
      certificateurs: infoRncpCertificateurs.info,
      nsf: nsfUpdated.info,
      romes: romesUpdated.info,
      blocs_competences: blocUpdated.info,
      voix_acces: voixAccesUpdated.info,
      cfd: {
        ...cfdData.messages,
      },
    },
  };
};
module.exports.getDataFromRncp = getDataFromRncp;
