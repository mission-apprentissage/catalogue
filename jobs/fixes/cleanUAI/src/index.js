const { execute } = require("../../../../common/scriptWrapper");
const cleanUAI = require("./services/updateEstablishment");

execute(() => cleanUAI());
