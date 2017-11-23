import config from "./config.json";

config.mailgun.apiKey = process.env.MAILGUN_API_KEY;
if (process.env.JWT_SECRET_KEY) {
    config.jwt.secretKey = process.env.JWT_SECRET_KEY;
}
// export default config;
export const {database: dbConfig, log: logConfig, jwt: jwtConfig, mailgun: mailConfig} = config;

