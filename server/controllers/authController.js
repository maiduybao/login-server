import jwt from "jsonwebtoken";
import log4js from "log4js";
import {jwtConfig} from "../config";
import userService from "../services/userService";
import validate from "../middleware/validate";
import credentialSchema from "../jsonschema/authentication.json";

const logger = log4js.getLogger("AuthController");

class AuthController {
    constructor(router) {
        this.router = router;
        this.urlMapping();
    }

    /*
    baseUrl: /api/v1
   */
    urlMapping() {
        this.router.post("/oauth/authenticate", validate(credentialSchema), this.authenticate);
    }

    authenticate(req, res) {
        const promise = userService.getUserByEmail(req.body.email);
        promise
            .then((user) => {
                userService.comparePassword(req.body.password, user.password)
                    .then((isMatched) => {
                        if (isMatched) {
                            const {_id: id, email, firstName, lastName, roles} = user;
                            const payload = {
                                id,
                                email,
                                firstName,
                                lastName,
                                roles
                            };
                            const token = jwt.sign({user: payload}, jwtConfig.secretKey, {expiresIn: jwtConfig.tokenExpires});
                            res.json({
                                accessToken: token,
                                tokenType: "Bearer"
                            });
                        } else {
                            res.status(401).json({error: {message: "Invalid email/password combination"}});
                        }
                    })
                    .catch((error) => {
                        logger.error("authenticate", error);
                        res.status(401).json({error: {message: "Invalid email/password combination"}});
                    });
            })
            .catch((error) => {
                logger.error("authenticate", error);
                res.status(404).json({error: {message: "Email does not exist"}});
            });
    }
}

export default AuthController;
