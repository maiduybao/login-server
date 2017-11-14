import log4js from "log4js";
import RSVP from "rsvp";

import RoleModel from "../models/role";

const logger = log4js.getLogger("RoleService");

class RoleService {
    populateDefaultRoles() {
        return RoleModel.count({}).exec()
            .then((count) => {
                if (count === 0) {
                    logger.info("add default Role based ACLs");
                    let userRoleAcl = new RoleModel({
                        name: "Client",
                        allows: [
                            {
                                resource: "users",
                                operations: ["read"]
                            }
                        ]
                    });
                    userRoleAcl.save();
                    userRoleAcl = new RoleModel({
                        name: "Manager",
                        allows: [
                            {
                                resource: "users",
                                operations: ["read"]
                            }
                        ]
                    });
                    userRoleAcl.save();
                    userRoleAcl = new RoleModel({
                        name: "Admin",
                        allows: [
                            {
                                resource: "users",
                                operations: ["*"]
                            },
                            {
                                resource: "roles",
                                operations: ["*"]
                            }
                        ]
                    });
                    userRoleAcl.save();
                    return RSVP.resolve();
                }
            })
            .catch((error) => {
                logger.error("populateDefaultRoles", error);
                throw error;
            });
    }

    getRoleById(id) {
        return RoleModel.findById(id)
            .lean()
            .exec()
            .catch((error) => {
                logger.error("getRoleById", error);
                throw error;
            });
    }

    getRoles() {
        return RoleModel.find()
            .lean()
            .exec()
            .catch((error) => {
                logger.error("getRoles", error);
                throw error;
            });
    }


    getRoleByName(name) {
        return RoleModel.findOne({name})
            .lean()
            .exec()
            .catch((error) => {
                logger.error("getRoleByName", error);
                throw error;
            });
    }

    updateRole(id, update) {
        return RoleModel.findByIdAndUpdate(id, update, {new: true})
            .lean()
            .exec()
            .catch((error) => {
                logger.error("updateRole", error);
                throw error;
            });
    }

    addAllowToRole(roleId, allow) {
        return this.getRoleById(roleId)
            .then((role) => {
                role.allows.push(allow);
                return role.save();
            })
            .catch((error) => {
                logger.error("addAllowToRole", error);
                throw error;
            });
    }
}

export default new RoleService();
