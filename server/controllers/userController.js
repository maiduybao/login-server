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
            const user = new User({
                email: req.body.email,
                password: req.body.password,
            });

            user.save((error) => {
                if (error) {
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
                res.status(400).json({
                    success: false,
                    error: "user name and password is not valid"
                });
                return;
            }
            if (user) {
                user.comparePassword(req.body.password, (error2, isMatch) => {
                    if (error2) {
                        logger.error(error2);
                        res.status(400).json({
                            success: false,
                            error: "user name and password is not valid"
                        });
                        return;
                    }
                    if (isMatch) {
                        const payload = {
                            sub: user._id,
                            email: user.email,
                            roles: user.roles
                        };
                        const token = jwt.sign(payload, jwtConfig.secretKey, {expiresIn: 1000});

                        res.json({
                            success: true,
                            payload: {token: `${jwtConfig.headerScheme.toUpperCase()} ${token}`}
                        });
                    } else {
                        res.status(400).json({
                            success: false,
                            error: "Authentication failed. Password is not matched."
                        });
                    }
                });
            } else {
                res.status(400).json({
                    success: false,
                    message: "Authentication failed. User is not found."
                });
            }
        });
    }

    static profile(req, res) {
        res.json(req.user);
    }
}

export default UserController;