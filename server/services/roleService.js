import log4js from "log4js";
import omit from "lodash/omit";

import RoleModel from "../models/role";

const logger = log4js.getLogger("RoleService");

class RoleService {

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

    briefRoleFormat(role) {
        const {_id: id, ...rest} = role;
        const others = omit(rest, ["password", "__v"]);
        return {
            id,
            ...others
        };
    }
}

export default new RoleService();
