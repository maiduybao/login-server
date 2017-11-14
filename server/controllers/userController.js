import log4js from "log4js";
import omit from "lodash/omit";
// services
import UserService from "../services/userService";
// middleware
import authenticated from "../middleware/authenticated";
import validate from "../middleware/validate";
import authorized from "../middleware/authorized";

// Json Schema
import addUserSchema from "../jsonschema/addUser.json";
import registerUserSchema from "../jsonschema/registerUser.json";
import updateUserSchema from "../jsonschema/updateUser.json";

const logger = log4js.getLogger("UserController");

class UserController {

    constructor(router) {
        this.router = router;
        this.urlMapping();
    }

    /*
    baseUrl: /api/v1
    */
    urlMapping() {
        this.router.get("/users", authenticated, authorized("users:list"), this.getUsers);
        this.router.get("/users/:id", authenticated, authorized("users:read"), this.getUser);
        this.router.post("/users", authenticated, authorized("users:readwrite"), validate(addUserSchema), this.addUser);
        this.router.post("/users/register", validate(registerUserSchema), this.addUser);
        this.router.put("/users/:id", authenticated, authorized("users:readwrite"), validate(updateUserSchema), this.updateUser);
    }

    getUser(req, res) {
        UserService.getUserById(req.params.id)
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

    getUsers(req, res) {
        UserService.getUsers()
            .then((users) => {
                const payload = users.map((user) => {
                    const {_id: id, ...rest} = user;
                    const others = omit(rest, ["password", "__v"]);
                    others.roles = others.roles.map((role) => role.name);
                    return {
                        id,
                        ...others
                    };
                });
                res.send(payload);
            })
            .catch((error) => {
                logger.error("getUsers", error);
                // NOT FOUND
                res.sendStatus(404);
            });
    }

    updateUser(req, res) {
        UserService.updateUser(req.params.id, req.body)
            .then((user) => {
                const {_id: id, ...rest} = user;
                const others = omit(rest, ["password", "__v"]);
                others.roles = others.roles.map((role) => role.name);
                const payload = {
                    id,
                    ...others
                };
                res.send(payload);
            })
            .catch((error) => {
                logger.error("updateUser", error);
                // NOT FOUND
                res.sendStatus(404);
            });
    }

    addUser(req, res) {
        UserService.addUser(req.body)
            .then((user) => {
                if (user) {
                    res.status(201).json({id: user._id});
                } else {
                    // CONFLICT
                    res.status(409).json(
                        {error: {message: "email is already exist"}}
                    );
                }
            })
            .catch((error) => {
                logger.error("addUser", error);
                // BAD REQUEST
                res.sendStatus(400);
            });
    }
}

export default UserController;
