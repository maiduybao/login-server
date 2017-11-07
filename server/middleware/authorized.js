import find from "lodash/find";
import forEach from "lodash/forEach";
import union from "lodash/union";
import clone from "lodash/clone";
import filter from "lodash/filter";
import map from "lodash/map";
import intersection from "lodash/intersection";


import {aclConfig} from "../config";

import log4js from "log4js";

const logger = log4js.getLogger("middleware.authorized");

const parseResourcePermissions = (permission) => {
    const data = permission.split(":");
    return {
        resource: data[0],
        permissions: data[1].split(",").map((item) => item.trim())
    };
};

const intersectUserAndResourceForAclRoles = (userRoles, resource) => {
    const aclRoles = [];
    forEach(userRoles, (role) => {
        const aclRole = find(aclConfig, {role});
        if (aclRole) {
            const allows = filter(aclRole.allows, (allow) => Boolean(allow[resource]));
            if (allows && allows.length > 0) {
                const cloneAclRole = clone(aclRole);
                cloneAclRole.allows = allows;
                aclRoles.push(cloneAclRole);
            }
        }
    });
    return aclRoles;
};

const unionAllows = (intersectAclRoles, resource) => {
    let unionResults = [];
    forEach(intersectAclRoles, (intersectAclRole) => {
        const listAllows = map(intersectAclRole.allows,
            (roleAllows) => roleAllows[resource]);
        forEach(listAllows, (allows) => {
            unionResults = union(unionResults, allows);
        });
    });
    return unionResults;
};

export default (permission) => (req, res, next) => {
    const {roles} = req.user;
    const resourcePermission = parseResourcePermissions(permission);
    const intersectAclRoles = intersectUserAndResourceForAclRoles(roles, resourcePermission.resource);
    logger.info("intersectAclRoles", JSON.stringify(intersectAclRoles));
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
