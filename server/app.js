import express from "express";
import path from "path";

// const favicon = require("serve-favicon");
import log4js from "log4js";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import rsvp from "rsvp";
import passport from "passport";
// app configs
import {database as dbConfig, log as logConfig} from "./config/config";
import passportStrategy from "./config/passport";

import index from "./routes/index";
//  import users from "./routes/users";
import api from "./routes/api";

mongoose.Promise = rsvp.Promise;

/**
 * Initialise log4js first, so we don't miss any log messages
 */
log4js.configure(logConfig);

const app = express();

// view engine setup
app.set("views", "./views");
app.set("view engine", "hbs");

// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(log4js.connectLogger(log4js.getLogger("http"), {level: "auto"}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// initialize passport
app.use(passport.initialize());

// database connection
mongoose.connect(dbConfig.uri, dbConfig.options).
    catch((error) => {
        const logger = log4js.getLogger("Mongo");

        logger.error(error.message);
    });

// bring in passport strategy
passportStrategy(passport);

// allow for cross-origin API requests
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Headers",
        "Content-Type, Accept, Authorization, Content-Length, X-Requested-With");
    res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,PATCH,OPTIONS");

    next();
});

// routes
app.use("/", index);
//  app.use("/users", users);
app.use("/api", api);
app.get("/ping", (req, res) => {
    res.json({success: true});
});


// catch 404 and forward to error handler
app.use((req, res, next) => {
    const err = new Error("Not Found");

    err.status = 404;
    next(err);
});

// error handler
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

export default app;
