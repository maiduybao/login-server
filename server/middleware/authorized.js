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

const parseResourcePermission = (permission) => {
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
            const permissions = filter(aclRole.permissions, (aclPermission) => Boolean(aclPermission[resource]));
            if (permissions && permissions.length > 0) {
                const cloneAclRole = clone(aclRole);
                cloneAclRole.permissions = permissions;
                aclRoles.push(cloneAclRole);
            }
        }
    });
    return aclRoles;
};

const unionPermissions = (intersectAclRoles, resource) => {
    let unionResults = [];
    forEach(intersectAclRoles, (intersectAclRole) => {
        const permitList = map(intersectAclRole.permissions,
            (permit) => permit[resource].split(",").map((item) => item.trim()));
        forEach(permitList, (item) => {
            unionResults = union(unionResults, item);
        });
    });
    return unionResults;
};

export default (permission) => (req, res, next) => {
    const {roles} = req.user;
    const resourcePermission = parseResourcePermission(permission);
    const intersectAclRoles = intersectUserAndResourceForAclRoles(roles, resourcePermission.resource);
    if (intersectAclRoles.length > 0) {
        const aclPermissions = unionPermissions(intersectAclRoles, resourcePermission.resource);
        logger.info("aclPermissions", aclPermissions);
        if (find(aclPermissions, (permit) => permit === "*") ||
            intersection(resourcePermission.permissions, aclPermissions).length !== 0) {
            return next();
        }
    }
    res.status(403).json({error: {message: "Permission Denied"}});
};
