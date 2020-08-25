const bcnControlller = require("./controllers");

const run = async cdf => {
  try {
    const result = bcnControlller.getDataFromCdf(cdf);
    console.log(result);
  } catch (error) {
    console.log(error);
  }
};

run("32321014");
