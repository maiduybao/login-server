import jwt from "jsonwebtoken";
import log4js from "log4js";
import {jwtConfig} from "../config";
import UserService from "../services/userService";
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
        const promise = UserService.getUserByEmail(req.body.email);
        promise
            .then((user) => {
                if (user) {
                    UserService.comparePassword(req.body.password, user.password)
                        .then((isMatched) => {
                            if (isMatched) {
                                if (user.active) {
                                    logger.info("user", JSON.stringify(user));
                                    const token = jwt.sign({user: UserService.briefUserFormat(user)}, jwtConfig.secretKey, {expiresIn: jwtConfig.tokenExpires});
                                    res.status(200).json({
                                        accessToken: token,
                                        tokenType: "Bearer"
                                    });
                                } else {
                                    res.status(400).json({
                                        status: 400,
                                        message: "you need to activate your profile"
                                    });
                                }
                            } else {
                                res.status(400).json({
                                    status: 400,
                                    message: "Invalid email/password combination"
                                });
                            }
                        })
                        .catch((error) => {
                            logger.error("authenticate", error);
                            res.status(400).json({
                                status: 400,
                                message: "Invalid email/password combination"
                            });
                        });
                } else {
                    // BAD REQUEST
                    res.status(400).json({
                        status: 400,
                        message: "Invalid email/password combination"
                    });
                }
            })
            .catch((error) => {
                logger.error("authenticate", error);
                // INTERNAL ERROR
                res.status(500).json({
                    status: 500,
                    message: error.message
                });
            });
    }
}

export default AuthController;
