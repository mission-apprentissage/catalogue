const infosCodes = {
  Empty: 0,
  Found: 1,
  NoCodeEn: 2,
  NoIdccsFound: 3,
  NoOpcosFound: 4,
};

const computeCodes = ["NC", "Trouvés", "Aucun code diplôme", "Non trouvés - pas d'idcc", "Non trouvés - pas d'OPCOs"];

module.exports = {
  infosCodes,
  computeCodes,
};
