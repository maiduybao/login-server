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
        let foundUser = null;
        userService.getUserByEmail(email)
            .then((user) => {
                foundUser = user;
                return userService.comparePassword(password, user.password);
            })
            .then((isMatched) => {
                if (isMatched) {
                    done(null, foundUser);
                } else {
                    done(null, false);
                }
            })
            .catch((error) => {
                logger.error(error);
                done(null, false);
            });
    }));

};
