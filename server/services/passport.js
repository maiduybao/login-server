import {ExtractJwt, Strategy} from "passport-jwt";
import {jwtConfig} from "../config/index";
import log4js from "log4js";

const logger = log4js.getLogger("passport");
import userService from "./userService";


export default (passport) => {
    const opts = {
        jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme(jwtConfig.headerScheme),
        secretOrKey: jwtConfig.secretKey
    };

    passport.use(new Strategy(opts, (payload, done) => {
        logger.debug("jwt payload", JSON.stringify(payload));
        userService.getUserById(payload.user.id)
        .then((user) => {
            if (user) {
                done(null, user);
            } else {
                done(null, false);
            }
        })
        .catch((error) => {
            logger.error(error);
            done(error, false);
        });
    }));
};
