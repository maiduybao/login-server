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

const logger = log4js.getLogger("startup");

class Server {
    constructor () {
        this.createHttpServer();
        this.createHttpsServer();
    }

    createHttpServer () {
        const port = process.env.PORT || 3000;
        app.set("port", port);
        const httpServer = http.createServer(app);
        httpServer.listen(port);
        httpServer.on("error", (error) => {
            if (error.syscall !== "listen") {
                throw error;
            }
            const bind = typeof port === "string" ? `Pipe ${port}` : `Port ${port}`;

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

        httpServer.on("listening", () => {
            const addr = httpServer.address();
            const bind = typeof addr === "string" ? `pipe ${addr}` : `port ${addr.port}`;
            logger.debug(`HTTP Listening on ${bind}`);
        });
    }

    createHttpsServer () {
        const port = 8443;
        const readFile = rsvp.denodeify(fs.readFile);
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
            httpsServer.listen(port);
            httpsServer.on("error", (error) => {
                if (error.syscall !== "listen") {
                    throw error;
                }

                const bind = typeof port === "string" ? `Pipe ${port}` : `Port ${port}`;

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
                const bind = typeof addr === "string" ? `pipe ${addr}` : `port ${addr.port}`;
                logger.debug(`HTTPS Listening on ${bind}`);
            });


        })
        .catch((error) => {
            logger.error(error);
        });
    }
}

new Server();

