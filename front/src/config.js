import { getEnvName, getConfig } from "@config";

const hostname = window.location.hostname;

export { getEnvName, getConfig };

export default getConfig(getEnvName(hostname));
