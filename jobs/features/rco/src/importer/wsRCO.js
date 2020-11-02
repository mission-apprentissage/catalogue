const axios = require("axios");

const endpoint = "https://extranet.intercariforef.org/formations_apprentissage";
const params = {
  login: "mna",
  pwd: process.env.RCO_WS_PWD,
};

class WsRCO {
  constructor() {}

  async getRCOcatalogue() {
    try {
      const response = await axios.get(`${endpoint}/catalogue-formations-apprentissage.json`, {
        headers: {
          Authorization: `Basic ${this.encode64Token()}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  encode64Token() {
    let buff = new Buffer.from(`${params.login}:${params.pwd}`);
    return buff.toString("base64");
  }
}

const wsRCO = new WsRCO();
module.exports = wsRCO;
