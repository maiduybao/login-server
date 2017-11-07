import config from "./config.json";
import acl from "./acl.json";
// export default config;
export const {database: dbConfig, log: logConfig, jwt: jwtConfig} = config;
export const {acl: aclConfig} = acl;

