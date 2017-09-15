const config = {
    database: {
        uri: "mongodb://127.0.0.1:27017/user_db",
        options: {useMongoClient: true}
    },
    log: {
        appenders: {
            out: {type: "stdout"},
            app: {
                type: "file",
                filename: "./log/application.log",
                maxLogSize: 10485760,
                layout: {
                    type: "pattern",
                    pattern: "%d{ISO8601} %p %c %m%n"
                },
            },
        },
        categories: {
            default: {
                appenders: [
                    "out",
                    "app"
                ],
                level: "debug"
            },
        }
    },
    jwt: {
        secretKey: "hqF65AiumUo=",
        // headerScheme is only jwt, Bearer
        headerScheme: "jwt",
        session: false,
        // tokenExpires in seconds. Eg: 1000, "2 days", "10h", "7d"
        tokenExpires: "1 days"
    }
};

// export default config;
export const {database, log, jwt} = config;
