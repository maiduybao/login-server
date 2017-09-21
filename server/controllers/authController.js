import jwt from "jsonwebtoken";
import log4js from "log4js";
import {jwtConfig} from "../config";
import userService from "../services/userService";
import validate from "../middlewares/validate";
import credentialSchema from "../jsonschema/authentication.json";

const logger = log4js.getLogger("authController");

class AuthController {
    constructor (router) {
        this.router = router;
        this.registerRoutes();
    }

    registerRoutes () {
        this.router.post("/authenticate", validate(credentialSchema), this.authenticate);
    }

    authenticate (req, res) {
        logger.log("call authenticate");
        const promise = userService.getUserByEmail(req.body.email);
        promise
        .then((user) => {
            user.comparePassword(req.body.password, (error, isMatch) => {
                if (error) {
                    throw new Error("Invalid user name and password");
                }
                if (isMatch) {
                    const {_id: id, email, firstName, lastName, roles} = user;
                    const payload = {
                        id,
                        email,
                        firstName,
                        lastName,
                        roles
                    };
                    const token = jwt.sign({user: payload}, jwtConfig.secretKey, {expiresIn: jwtConfig.tokenExpires});
                    res.json({accessToken: `${jwtConfig.headerScheme.toUpperCase()} ${token}`});
                } else {
                    res.status(401).json({error: {message: "Invalid user name and password"}});
                }
            });
        })
        .catch((error) => {
            logger.error("authenticate", error);
            res.sendStatus(404);
        });
    }
}

export default AuthController;
