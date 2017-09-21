/**
 * Module dependencies.
 */
import app from "./app";
import http from "http";
import https from "https";
import log4js from "log4js";
import fs from "fs";
import path from "path";
import rsvp from "rsvp";


const readFile = rsvp.denodeify(fs.readFile);

/**
 * Initialise log4js first, so we don't miss any log messages
 */
const logger = log4js.getLogger("startup");

/**
 * Get port from environment and store in Express.
 */
/**
 * Normalize a port into a number, string, or false.
 */
const port = process.env.PORT || 3000;

app.set("port", port);

/**
 * Create HTTP server.
 */
const httpServer = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */
httpServer.listen(port);

/**
 * Event listener for HTTP server "error" event.
 */
httpServer.on("error", (error) => {
    if (error.syscall !== "listen") {
        throw error;
    }
    const bind = typeof port === "string"
        ? `Pipe ${port}`
        : `Port ${port}`;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case "EACCES":
            logger.error(`${bind} requires elevated privileges`);
            process.exit(1);
            break;
        case "EADDRINUSE":
            logger.error(`${bind} is already in use`);
            process.exit(1);
            break;
        default:
            throw error;
    }
});

/**
 * Event listener for HTTP server "listening" event.
 */
httpServer.on("listening", () => {
    const addr = httpServer.address();
    const bind = typeof addr === "string"
        ? `pipe ${addr}`
        : `port ${addr.port}`;

    logger.debug(`HTTP Listening on ${bind}`);
});

/**
 * load credentials
 */

// const privateKey = fs.readFileSync(path.join(".", "server", "key.pem"), "utf8");
// const certificate = fs.readFileSync(path.join(".", "server", "cert.pem"), "utf8");

const promises = [
    readFile(path.join(".", "ssl", "key.pem"), "utf8"),
    readFile(path.join(".", "ssl", "cert.pem"), "utf8")
];

rsvp.all(promises)
.then((results) => {
    const credentials = {
        key: results[0],
        cert: results[1]
    };
    const httpsServer = https.createServer(credentials, app);
    httpsServer.listen(8443);
    httpsServer.on("error", (error) => {
        if (error.syscall !== "listen") {
            throw error;
        }

        const bind = typeof port === "string"
            ? `Pipe ${port}`
            : `Port ${port}`;

        switch (error.code) {
            case "EACCES":
                logger.error(`${bind} requires elevated privileges`);
                process.exit(1);
                break;
            case "EADDRINUSE":
                logger.error(`${bind} is already in use`);
                process.exit(1);
                break;
            default:
                throw error;
        }
    });


    httpsServer.on("listening", () => {
        const addr = httpsServer.address();
        const bind = typeof addr === "string"
            ? `pipe ${addr}`
            : `port ${addr.port}`;

        logger.debug(`HTTPS Listening on ${bind}`);
    });


})
.catch((error) => {
    logger.error(error);
});
