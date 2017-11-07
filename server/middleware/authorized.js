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
        permissions: data[1].split(",").map((item) => item.trim())
    };
};

const filterPermissionByResource = (userRoles, resource) => {
    let permissions = [];
    forEach(userRoles, (role) => {
        const filterAllows = filter(role.allows, (allow) => allow.resource === resource);
        if (filterAllows.length > 0) {
            const permissionGroupList = map(filterAllows, (filterAllow) => filterAllow.permissions);
            forEach(permissionGroupList, (permissionGroup) => {
                permissions = union(permissions, permissionGroup);
            });
        }
    });
    return permissions;
};

export default (permission) => (req, res, next) => {
    const {roles} = req.user;
    logger.info("user roles", JSON.stringify(roles));
    const resourcePermission = parseResourcePermissions(permission);
    const userRolePermissions = filterPermissionByResource(roles, resourcePermission.resource);
    if (userRolePermissions.length > 0) {
        logger.info("userRolePermissions", userRolePermissions);
        if (find(userRolePermissions, (allow) => allow === "*") ||
            intersection(resourcePermission.permissions, userRolePermissions).length !== 0) {
            return next();
        }
    }
    res.status(403).json({error: {message: "Permission Denied"}});
};
