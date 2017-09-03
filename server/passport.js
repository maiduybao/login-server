import {ExtractJwt, Strategy} from "passport-jwt";
import User from "./models/user";
import {jwt as jwtConfig} from "./config/config";
import log4js from "log4js";

const logger = log4js.getLogger("passport");

export default (passport) => {
    const opts = {
        jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme(jwtConfig.headerScheme),
        secretOrKey: jwtConfig.secretKey
    };

    passport.use(new Strategy(opts, (payload, done) => {
        logger.debug("jwt payload", JSON.stringify(payload));
        User.findById(payload.sub, (error, user) => {
            logger.debug("error", JSON.stringify(error));

            if (error !== null) {
                logger.error(error);
                return done(error, false);
            }
            logger.debug("user", JSON.stringify(user));
            if (user) {
                return done(null, user);
            }
            return done(null, false);
        });
    }));
};
