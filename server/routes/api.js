import express from "express";
import passport from "passport";
import UserController from "../controllers/userController";
import {jwt as jwtConfig} from "../config/config";

const router = express.Router();

// Register new user
router.put("/user/register", UserController.register);
// Authenticate user
router.post("/user/authenticate", UserController.authenticate);
//  User Information
router.get("/user/profile", passport.authenticate(jwtConfig.headerScheme, {session: jwtConfig.session}), UserController.profile);

module.exports = router;
``