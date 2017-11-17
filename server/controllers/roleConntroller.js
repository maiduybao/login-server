import log4js from "log4js";
import omit from "lodash/omit";

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
    constructor(router) {
        this.router = router;
        this.urlMapping();
    }

    /*
    baseUrl: /api/v1
    */
    urlMapping() {
        this.router.get("/roles", authenticated, authorized("roles:list"), this.getRoles);
        this.router.get("/users/:id", authenticated, authorized("roles:read"), this.getRole);
        this.router.put("/roles/:id", authenticated, authorized("roles:readwrite"), validate(updateRoleSchema), this.updateRole);
    }

    getRoles(req, res) {
        RoleService.getRoles()
            .then((roles) => {
                const payload = roles.map((user) => {
                    const {_id: id, ...rest} = user;
                    const others = omit(rest, ["password", "__v"]);
                    return {
                        id,
                        ...others
                    };
                });
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
            .then((user) => {
                const {_id: id, ...rest} = user;
                const others = omit(rest, ["password", "__v"]);
                const payload = {
                    id,
                    ...others
                };
                res.json(payload);
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
                const {_id: id, ...rest} = role;
                const others = omit(rest, ["password", "__v"]);
                const payload = {
                    id,
                    ...others
                };
                res.json(payload);
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

export default RoleController;
