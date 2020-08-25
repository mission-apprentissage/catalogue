const bcnControlller = require("./controllers");

const run = async cdf => {
  const result = bcnControlller.getDataFromCdf(cdf);
  console.log(result);
};

run("35020007");
