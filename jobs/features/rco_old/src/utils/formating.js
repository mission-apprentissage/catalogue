const formatCodePostal = codePostal => {
  return codePostal ? `${codePostal}`.trim() : "";
};

module.exports.formatCodePostal = formatCodePostal;
