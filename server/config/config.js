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
                    pattern: "%d{ABSOLUTE} %p %c %m%n"
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
        headerScheme: "jwt"
    }
};

// export default config;
export const {database, log, jwt} = config;
