import find from "lodash/find";
import forEach from "lodash/forEach";
import union from "lodash/union";
import clone from "lodash/clone";
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

const intersectRoleAndResource = (userRoles, resource) => {
    const aclRoles = [];
    forEach(userRoles, (role) => {
        const filterAllows = filter(role.allows, (allow) => allow.resource === resource);
        if (filterAllows.length > 0) {
            const cloneAclRole = clone(role);
            cloneAclRole.allows = filterAllows;
            aclRoles.push(cloneAclRole);
        }
    });
    return aclRoles;
};

const unionAllows = (intersectAclRoles) => {
    let unionResults = [];
    forEach(intersectAclRoles, (intersectAclRole) => {
        const listAllows = map(intersectAclRole.allows,
            (allow) => allow.permissions);
        forEach(listAllows, (allows) => {
            unionResults = union(unionResults, allows);
        });
    });
    return unionResults;
};

export default (permission) => (req, res, next) => {
    const {roles} = req.user;
    logger.info("user roles", JSON.stringify(roles));
    const resourcePermission = parseResourcePermissions(permission);
    const intersectAclRoles = intersectRoleAndResource(roles, resourcePermission.resource);
    logger.info("intersectRoleAndResource", JSON.stringify(intersectAclRoles));
    if (intersectAclRoles.length > 0) {
        const aclAllows = unionAllows(intersectAclRoles, resourcePermission.resource);
        logger.info("aclAllows", aclAllows);
        if (find(aclAllows, (allow) => allow === "*") ||
            intersection(resourcePermission.permissions, aclAllows).length !== 0) {
            return next();
        }
    }
    res.status(403).json({error: {message: "Permission Denied"}});
};
