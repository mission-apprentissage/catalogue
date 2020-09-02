const infosCodes = {
  cfd: {
    OutDated: 0,
    NotFound: 1,
    Found: 2,
    Updated: 3,
  },
  niveau: {
    Error: 0,
    NothingDoTo: 1,
    Updated: 2,
  },
  intitule: {
    Error: 0,
    NothingDoTo: 1,
    Updated: 2,
  },
  diplome: {
    Error: 0,
    NothingDoTo: 1,
    Updated: 2,
  },
  specialite: {
    Error: 0,
    NothingDoTo: 1,
    Updated: 2,
    NotProvided: 3,
  },
  mef: {
    Error: 0,
    NotFound: 1,
    NothingDoTo: 2,
    Updated: 3,
    Multiple: 4,
  },
};

const computeCodes = {
  cfd: ["Périmé", "Non trouvé", "Trouvé", "Mis à jour"],
  niveau: ["Erreur", "Ok", "Mis à jour"],
  intitule: ["Erreur", "Ok", "Mis à jour"],
  diplome: ["Erreur", "Ok", "Mis à jour"],
  specialite: ["Erreur", "Ok", "Mis à jour", "Non fourni"],
  mef: ["Erreur", "Non trouvé", "Ok", "Mis à jour", "Erreur Plusieurs code CFD trouvé"],
};

const niveaux = [
  "3 (CAP...)",
  "4 (Bac...)",
  "5 (BTS, DUT...)",
  "6 (Licence...)",
  "7 (Master, titre ingénieur...)",
  "8 (Doctorat...)",
];
const mappingNiveauCodeEn = {
  "5": 3,
  "4": 4,
  "3": 5,
  "2": 6,
  "1": 7,
  "8": 8,
  "0102": 3,
  "0103": 4,
};

module.exports = {
  infosCodes,
  computeCodes,
  mappingNiveauCodeEn,
  niveaux,
};
