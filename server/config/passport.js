import {ExtractJwt, Strategy} from "passport-jwt";
import {User} from "../models/user";
import {jwt as jwtConfig} from "./config";

export default (passport) => {
    const opts = {
        jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme(jwtConfig.headerScheme),
        secretOrKey: jwtConfig.secretKey
    };

    passport.use(new Strategy(opts, (payload, done) => {
        User.findOne({id: payload.sub}, (error, user) => {
            if (error) {
                return done(error, false);
            }
            if (user) {
                return done(null, user);
            }
            return done(null, false);
        });
    }));
};
