import log4js from "log4js";

// services
import RoleService from "../services/roleService";
// middleware
import authenticated from "../middleware/authenticated";
import validate from "../middleware/validate";
import authorized from "../middleware/authorized";

// Json Schema
import updateRoleSchema from "../jsonschema/updateRole.json";

const logger = log4js.getLogger("RoleController");


class RoleController {
    urlMapping(router) {
        router.get("/roles", authenticated, authorized("roles:list"), this.getRoles);
        router.get("/users/:id", authenticated, authorized("roles:read"), this.getRole);
        router.put("/roles/:id", authenticated, authorized("roles:readwrite"), validate(updateRoleSchema), this.updateRole);
    }

    getRoles(req, res) {
        RoleService.getRoles()
            .then((roles) => {
                const payload = roles.map((role) => RoleService.briefRoleFormat(role));
                res.json(payload);
            })
            .catch((error) => {
                logger.error("getRoles", error);
                // NOT FOUND
                res.status(404).json({
                    status: 404,
                    message: "there are no role in the system"
                });
            });
    }


    getRole(req, res) {
        RoleService.getRoleById(req.params.id)
            .then((role) => {
                res.json(RoleService.briefRoleFormat(role));
            })
            .catch((error) => {
                logger.error("getRole", error);
                // NOT FOUND
                res.status(404).json({
                    status: 404,
                    message: "role is not found in the system"
                });
            });
    }

    updateRole(req, res) {
        RoleService.updateRole(req.params.id, req.body)
            .then((role) => {
                res.json(RoleService.briefRoleFormat(role));
            })
            .catch((error) => {
                logger.error("updateRole", error);
                // NOT FOUND
                res.status(404).json({
                    status: 404,
                    message: "role is not found in the system"
                });
            });
    }
}

export default new RoleController();
