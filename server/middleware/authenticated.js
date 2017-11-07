import passport from "passport";

export default (req, res, next) => {
    let type = "jwt";
    if (req.headers.authorization && req.headers.authorization.split(" ")[0] === "Basic") {
        type = "basic";
    }
    return passport.authenticate(type, {session: false})(req, res, next);
};
