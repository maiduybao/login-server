import express, {Router} from "express";
import path from "path";
// import favicon from "serve-favicon";
import log4js from "log4js";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import RSVP from "rsvp";
import passport from "passport";
import CORS from "cors";
// app configs
import {dbConfig, logConfig} from "./config";
import PassportService from "./services/passport";

// controllers
import AuthController from "./controllers/authController";
import UserController from "./controllers/userController";
import RoleAclController from "./controllers/roleAclConntroller";


// services
import RoleAclService from "./services/roleAclService";
import UserService from "./services/userService";


const app = express();

class App {
    constructor() {
        this.initLogger();
        this.initViewEngine();
        this.initExpressMiddleware();
        this.initDB();
        this.initRoutes();
    }

    initLogger() {
        log4js.configure(logConfig);
    }

    initDB() {
        const logger = log4js.getLogger("mongodb");
        // set promise for mongodb
        mongoose.Promise = RSVP.Promise;
        // mongodb connection
        mongoose.connect(dbConfig.uri, dbConfig.options)
            .then(() => {
                logger.debug("connected to mongodb");
            })
            .then(() => RoleAclService.populateDefaultRoles())
            .then(() => UserService.populateDefaultUser())
            .catch((error) => {
                logger.fatal(error);
                process.exit(1);
            });

    }

    initExpressMiddleware() {
        app.use(log4js.connectLogger(log4js.getLogger("http"), {level: "auto"}));
        // app.use(favicon(path.join("./public", "favicon.ico")));
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({extended: false}));
        app.use(cookieParser());
        app.use(express.static(path.join("./public")));
        // allow for cross-origin API requests
        app.use(CORS());

        // initialize passport
        app.use(passport.initialize());
        PassportService(passport);

        // catch 404 and forward to error handler

        /*
        app.use((req, res, next) => {
            const err = new Error("Not Found");
            err.status = 404;
            next(err);
        });
        */


        // error handler
        /*
        app.use((err, req, res) => {
            // set locals, only providing error in development
            res.locals.message = err.message;
            if (req.app.get("env") === "development") {
                res.locals.error = err;
            } else {
                res.locals.error = {};
            }
            // render the error page
            const httpInternalError = 500;

            res.status(err.status || httpInternalError);
            res.render("error");
        });
        */
    }

    initViewEngine() {
        app.set("views", "./views");
        app.set("view engine", "hbs");
    }

    initRoutes() {
        app.get("/ping", (req, res) => {
            res.json({success: true});
        });

        const apiRouter = Router();
        app.use("/api", apiRouter);

        const apiV1 = Router();
        apiRouter.use("/v1", apiV1);

        new AuthController(apiV1);
        new UserController(apiV1);
        new RoleAclController(apiV1);
    }
}

new App();

export default app;
