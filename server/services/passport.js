import {ExtractJwt, Strategy} from "passport-jwt";
import {BasicStrategy} from "passport-http";

import {jwtConfig} from "../config";
import log4js from "log4js";

const logger = log4js.getLogger("passport");
import UserService from "./userService";


export default (passport) => {
    const opts = {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: jwtConfig.secretKey
    };

    passport.use(new Strategy(opts, (payload, done) => {
        UserService.getUserById(payload.user.id)
            .then((user) => {
                if (user && user.active) {
                //    user.roles = user.roles.map((role) => role.name);
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
        logger.info("email", email);
        logger.info("password", password);
        let foundUser = null;
        UserService.getUserByEmail(email)
            .then((user) => {
                if (user && user.active) {
                    foundUser = user;
                    return UserService.comparePassword(password || "", user.password);
                }
                return false;
            })
            .then((isMatched) => {
                if (isMatched) {
            //        foundUser.roles = foundUser.roles.map((role) => role.name);
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
