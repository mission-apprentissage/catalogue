const { execute } = require("../../../common/script/scriptWrapper");
const cleanUAI = require("./services/updateEstablishment");

execute(() => cleanUAI());
