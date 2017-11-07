import log4js from "log4js";
import RSVP from "rsvp";

import RoleAclModel from "../models/role";

const logger = log4js.getLogger("RoleAclService");

class RoleAclService {
    populateDefaultRoles() {
        return RoleAclModel.count({}).exec()
            .then((count) => {
                if (count === 0) {
                    logger.info("add default Role based ACLs");
                    let userRoleAcl = new RoleAclModel({
                        name: "Client",
                        allows: [
                            {
                                resource: "users",
                                permissions: ["read"]
                            }
                        ]
                    });
                    userRoleAcl.save();
                    userRoleAcl = new RoleAclModel({
                        name: "Manager",
                        allows: [
                            {
                                resource: "users",
                                permissions: ["read"]
                            }
                        ]
                    });
                    userRoleAcl.save();
                    userRoleAcl = new RoleAclModel({
                        name: "Admin",
                        allows: [
                            {
                                resource: "users",
                                permissions: ["*"]
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

    getRoleByName(name) {
        return RoleAclModel.findOne({name})
            .lean()
            .exec()
            .catch((error) => {
                logger.error("getRoleByName", error);
                throw error;
            });
    }
}

export default new RoleAclService();
