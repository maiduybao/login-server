import express from "express";
import jwt from "jsonwebtoken";
import passport from "passport";
import log4js from "log4js";
import {jwt as jwtConfig} from "../config/config";
import User from "../models/user";

const router = express.Router();
const logger = log4js.getLogger("api");

// Register new user
router.post("/register", (req, res) => {
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
});

// Authenticate user
router.post("/authenticate", (req, res) => {
    logger.debug("This is in the user authentication");
    User.findOne({email: req.body.email}, (error1, user) => {
        if (error1) {
            logger.error(error1);
            throw error1;
        }
        if (user) {
            user.comparePassword(req.body.password, (error2, isMatch) => {
                if (error2) {
                    logger.error(error2);
                    throw error2;
                }
                if (isMatch) {
                    const token = jwt.sign(user, jwtConfig.secretKey, {expiresIn: 1000});

                    res.json({
                        success: true,
                        payload: {
                            token: `JWT ${token}`,
                            user: {
                                id: user._id,
                                email: user.email,
                                role: user.role
                            }
                        },
                    });
                } else {
                    res.json({
                        success: false,
                        message: "Authentication failed. Password is not matched."
                    });
                }
            });
        } else {
            res.json({
                success: false,
                message: "Authentication failed. User is not found."
            });
        }
    });
});

router.get("/dashboard", passport.authenticate("jwt", {session: false}), (req, res) => {
    res.send(`it worked. User id is ${req.user._id}.`);
});

module.exports = router;
