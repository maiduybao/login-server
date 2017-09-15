import jwt from "jsonwebtoken";
import log4js from "log4js";
import {jwt as jwtConfig} from "../config/config";
import User from "../models/user";

const logger = log4js.getLogger("UserController");

class UserController {
    static register(req, res) {
        logger.debug("This is in the user register");
        if (!req.body.email || !req.body.password) {
            res.json({
                success: false,
                message: "Please enter an email and password to register."
            });
        } else {
            logger.debug("register:", req.body);
            const user = new User(req.body);

            user.save((error) => {
                if (error) {
                    logger.error("register error", error);
                    res.json({
                        success: false,
                        message: "That email is already exist."
                    });
                } else {
                    res.json({
                        success: true,
                        message: "Successful create new user"
                    });
                }
            });
        }
    }

    static authenticate(req, res) {
        logger.debug("This is in the user authentication");
        User.findOne({email: req.body.email}, (error1, user) => {
            if (error1) {
                logger.error(error1);
                res.json({
                    success: false,
                    error: "Authentication failed. User name and password is not valid"
                });
                return;
            }
            if (user) {
                user.comparePassword(req.body.password, (error2, isMatch) => {
                    if (error2) {
                        logger.error(error2);
                        res.json({
                            success: false,
                            error: "Authentication failed. User name and password is not valid"
                        });
                        return;
                    }
                    if (isMatch) {
                        const {_id: id, email, roles, firstName, lastName} = user;
                        const payload = {
                            id,
                            email,
                            roles,
                            firstName,
                            lastName
                        };
                        const token = jwt.sign({user: payload}, jwtConfig.secretKey, {expiresIn: jwtConfig.tokenExpires});
                        res.json({
                            success: true,
                            payload: {token: `${jwtConfig.headerScheme.toUpperCase()} ${token}`}
                        });
                    } else {
                        res.json({
                            success: false,
                            error: "Authentication failed. User name and password is not valid"
                        });
                    }
                });
            } else {
                res.json({
                    success: false,
                    error: "Authentication failed. User name and password is not valid"
                });
            }
        });
    }

    static profile(req, res) {
        res.json({
            email: req.user.email,
            roles: req.user.roles
        });
    }
}

export default UserController;
