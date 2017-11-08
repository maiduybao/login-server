import log4js from "log4js";
import omit from "lodash/omit";

// services
import RoleAclService from "../services/roleAclService";
// middleware
import authenticated from "../middleware/authenticated";
import validate from "../middleware/validate";
import authorized from "../middleware/authorized";

// Json Schema
import updateRoleSchema from "../jsonschema/updateRole.json";

const logger = log4js.getLogger("RoleAclController");


class RoleAclController {
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
        this.router.put("/roles/:id", authenticated, authorized("roles:write"), validate(updateRoleSchema), this.updateRole);
    }

    getRoles(req, res) {
        RoleAclService.getRoles()
            .then((roles) => {
                const payload = roles.map((user) => {
                    const {_id: id, ...rest} = user;
                    const others = omit(rest, ["password", "__v"]);
                    return {
                        id,
                        ...others
                    };
                });
                res.send(payload);
            })
            .catch((error) => {
                logger.error("getRoles", error);
                // NOT FOUND
                res.sendStatus(404);
            });
    }


    getRole(req, res) {
        RoleAclService.getRoleById(req.params.id)
            .then((user) => {
                const {_id: id, ...rest} = user;
                const others = omit(rest, ["password", "__v"]);
                const payload = {
                    id,
                    ...others
                };
                res.send(payload);
            })
            .catch((error) => {
                logger.error("getUser", error);
                // NOT FOUND
                res.sendStatus(404);
            });
    }

    updateRole(req, res) {
        RoleAclService.updateRole(req.params.id, req.body)
            .then((role) => {
                const {_id: id, ...rest} = role;
                const others = omit(rest, ["password", "__v"]);
                const payload = {
                    id,
                    ...others
                };
                res.send(payload);
            })
            .catch((error) => {
                logger.error("updateRole", error);
                // NOT FOUND
                res.sendStatus(404);
            });
    }

}

export default RoleAclController;
