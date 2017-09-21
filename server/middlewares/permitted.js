import intersection from "lodash/intersection";

export default (permissions) => (req, res, next) => {
        if (intersection(permissions, req.user.roles).length !== 0) {
            return next();
        }
        res.status(403).json({error: {message: "Permission Denied"}});
    };
