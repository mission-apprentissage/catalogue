let getAllUAIs = value => Array.from(value.matchAll(/([0-9]{7}[A-Z])/g)).map(m => m[1]);

module.exports = uai => {
  let newUAI = uai.toUpperCase();
  newUAI = newUAI.replace(/ /g, "");
  newUAI = newUAI.replace(/-/g, "");
  newUAI = newUAI.replace(/\./g, "");

  let uais = getAllUAIs(newUAI);
  if (uais.length === 1) {
    return uais[0];
  }
  return uai;
};
