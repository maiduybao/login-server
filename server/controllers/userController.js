import log4js from "log4js";
// services
import userService from "../services/userService";
// middleware
import authenticated from "../middlewares/authenticated";
import validate from "../middlewares/validate";
import permitted from "../middlewares/permitted";

// Json Schema
import addUserSchema from "../jsonschema/addUser.json";
import registerUserSchema from "../jsonschema/registerUser.json";
import updateUserSchema from "../jsonschema/updateUser.json";

const logger = log4js.getLogger("UserController");

class UserController {

    constructor (router) {
        this.router = router;
        this.registerRoutes();
    }

    registerRoutes () {
        this.router.get("/users", authenticated, permitted(["Admin"]), this.getUsers);
        this.router.get("/users/:id", authenticated, this.getUser);
        this.router.post("/users", authenticated, permitted(["Admin"]), validate(addUserSchema), this.addUser);
        this.router.post("/users/register", validate(registerUserSchema), this.addUser);
        this.router.put("/users/:id", authenticated, validate(updateUserSchema), this.updateUser);
    }

    getUser (req, res) {
        userService.getUserById(req.params.id)
        .then((user) => {
            const {_id: id, ...others} = user.toJSON();
            delete others.password;
            delete others.__v;
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

    getUsers (req, res) {
        userService.getUsers()
        .then((users) => {
            const payload = users.map((user) => {
                const {_id: id, ...others} = user.toJSON();
                delete others.password;
                delete others.__v;
                return {
                    id,
                    ...others
                };
            });
            res.send(payload);
        })
        .catch((error) => {
            logger.error("getUser", error);
            // NOT FOUND
            res.sendStatus(404);
        });
    }

    updateUser (req, res) {
        userService.getUserById(req.params.id)
        .then((user) => {
            const update = Object.assign(user, req.body);
            update.save();
            const {_id: id, ...others} = update.toJSON();
            delete others.password;
            delete others.__v;
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

    addUser (req, res) {
        userService.addUser(req.body)
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
