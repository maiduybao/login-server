import passport from "passport";
// config
import {jwtConfig} from "../config";

export default passport.authenticate(jwtConfig.headerScheme, {session: jwtConfig.session});
