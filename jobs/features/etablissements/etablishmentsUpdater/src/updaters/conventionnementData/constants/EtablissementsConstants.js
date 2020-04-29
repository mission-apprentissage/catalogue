const infosCodes = {
  infoDEPP: {
    MissingUai: -1,
    NotFound: 0,
    Found: 1,
  },
  infoDGEFP: {
    NotFound: 0,
    SirenMatch: 1,
    SiretMatch: 2,
    SiretSiegeSocialMatch: 3,
  },
  infoDATADOCK: {
    NotFound: 0,
    NotReferencable: 1,
    Referencable: 2,
  },
  infoDATAGOUV: {
    NotFound: 0,
    Found: 1,
  },
};

const computeCodes = {
  type: {
    ToCheck: "À vérifier",
    OF: "OF",
    CFA: "CFA",
  },
  conventionne: {
    No: "NON",
    Yes: "OUI",
  },
  declarePrefecture: {
    No: "NON",
    Yes: "OUI",
  },
};

const datadockValue = ["inconnu par datadock", "pas datadocké", "datadocké"];

module.exports = {
  infosCodes,
  computeCodes,
  datadockValue,
};
