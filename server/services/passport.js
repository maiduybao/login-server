import {ExtractJwt, Strategy} from "passport-jwt";
import {BasicStrategy} from "passport-http";

import {jwtConfig} from "../config/index";
import log4js from "log4js";

const logger = log4js.getLogger("passport");
import userService from "./userService";


export default (passport) => {
    const opts = {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
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


    passport.use(new BasicStrategy((email, password, done) => {
        userService.getUserByEmail(email)
            .then((user) => {
                userService.comparePassword(password, user.password)
                    .then((isMatched) => {
                        if (isMatched) {
                            done(null, user);
                        } else {
                            done(null, false);
                        }
                    })
                    .catch((error) => {
                        logger.error(error);
                        done(null, false);
                    });
            })
            .catch((error) => {
                logger.error(error);
                done(null, false);
            });
    }));

};
