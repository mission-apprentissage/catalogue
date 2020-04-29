const parseFichesFile = require("./parseFichesFile");
const parseCodesDiplomesFile = require("./parseCodesDiplomesFile");

module.exports = (rncpFichesFile, codesDiplomesFile) => {
  let referentiel = [];

  return {
    buildReferentiel: async () => {
      let { fiches, stats } = await parseFichesFile(rncpFichesFile);
      let { codesDiplomes } = await parseCodesDiplomesFile(codesDiplomesFile);

      referentiel = fiches.map(f => {
        return { ...f, CODE_DIPLOME: codesDiplomes[f.NUMERO_FICHE] };
      });

      return stats;
    },
    getCodeRNCP: codeDiplome => {
      let fiche = referentiel.find(fiche => fiche.CODE_DIPLOME === codeDiplome) || {};
      return fiche.NUMERO_FICHE || null;
    },
    getCodesROME: numeroFiche => {
      let fiche = referentiel.find(fiche => fiche.NUMERO_FICHE === numeroFiche) || {};
      return (fiche.CODES_ROME || []).map(r => r.CODE);
    },
    isHabilite: (numeroFiche, siret) => {
      let fiche = referentiel.find(fiche => fiche.NUMERO_FICHE === numeroFiche);
      if (!fiche) {
        return false;
      }

      let partenaires = fiche.PARTENAIRES || [];
      let isPartenaire =
        partenaires.filter(
          p => p.SIRET_PARTENAIRE === siret && p.HABILITATION_PARTENAIRE.startsWith("Habilitation pour former")
        ).length > 0;

      let certificateurs = fiche.CERTIFICATEURS || [];
      let isCertificateur =
        certificateurs.filter(p => {
          return p.SIRET_CERTIFICATEUR === siret;
        }).length > 0;

      return isPartenaire || isCertificateur;
    },
    isEligibleApprentissage: numeroFiche => {
      let fiche = referentiel.find(fiche => fiche.NUMERO_FICHE === numeroFiche);
      if (!fiche) {
        return false;
      }

      if (fiche.TYPE_ENREGISTREMENT === "Enregistrement de droit") {
        return true;
      }

      if (fiche.TYPE_ENREGISTREMENT === "Enregistrement sur demande" && fiche.SI_JURY_CA === "Oui") {
        return true;
      }

      return false;
    },
  };
};
