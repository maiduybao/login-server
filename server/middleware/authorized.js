import find from "lodash/find";
import forEach from "lodash/forEach";
import union from "lodash/union";
import filter from "lodash/filter";
import map from "lodash/map";
import intersection from "lodash/intersection";
// import RSVP from "RSVP";

import log4js from "log4js";

const logger = log4js.getLogger("middleware.authorized");

const parseResourcePermissions = (permission) => {
    const data = permission.split(":");
    return {
        resource: data[0],
        operations: data[1].split(",").map((item) => item.trim())
    };
};

const getAllowOperationsByResource = (userRoles, resource) => {
    let operations = [];
    forEach(userRoles, (role) => {
        const filterAllows = filter(role.allows, (allow) => (allow.resource === "*" || allow.resource === resource) && allow.type === "API");
        if (filterAllows.length > 0) {
            const permissionGroupList = map(filterAllows, (filterAllow) => filterAllow.operations);
            forEach(permissionGroupList, (permissionGroup) => {
                operations = union(operations, permissionGroup);
            });
        }
    });
    return operations;
};

export default (permissions) => (req, res, next) => {
    const {roles} = req.user;
    logger.info("user roles", JSON.stringify(roles));
    const resourcePermission = parseResourcePermissions(permissions);
    const userAllowOperations = getAllowOperationsByResource(roles, resourcePermission.resource);
    if (userAllowOperations.length > 0) {
        logger.info("userAllowOperations", userAllowOperations);
        if (find(userAllowOperations, (allow) => allow === "*") ||
            intersection(resourcePermission.operations, userAllowOperations).length !== 0) {
            return next();
        }
    }
    res.status(403).json({
        status: 403,
        success: false,
        message: "permission denied"
    });
};
