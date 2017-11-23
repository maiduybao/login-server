import log4js from "log4js";
import randomstring from "randomstring";

// services
import UserService from "../services/userService";
import EmailService from "../services/emailService";

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
        this.router.post("/users", authenticated, authorized("users:readwrite"), validate(addUserSchema), this.registerUser);
        this.router.post("/users/register", validate(registerUserSchema), this.registerUser);
        this.router.put("/users/:id", authenticated, authorized("users:readwrite"), validate(updateUserSchema), this.updateUser);
        this.router.get("/users/confirm/:token", this.registerConfirm);
    }

    getUser(req, res) {
        UserService.getUserById(req.params.id)
            .then((user) => {
                res.json(UserService.briefUserFormat(user));
            })
            .catch((error) => {
                logger.error("getUser", error);
                // NOT FOUND
                res.status(404).json(
                    {
                        status: 404,
                        message: "user is not found in the system"
                    }
                );
            });
    }

    getUsers(req, res) {
        UserService.getUsers()
            .then((users) => {
                const payload = users.map((user) => UserService.briefUserFormat(user));
                res.send(payload);
            })
            .catch((error) => {
                logger.error("getUsers", error);
                // NOT FOUND
                res.status(404).json(
                    {
                        status: 404,
                        message: "user is not found in the system"
                    }
                );
            });
    }

    updateUser(req, res) {
        UserService.updateUser(req.params.id, req.body)
            .then((user) => {
                res.json(UserService.briefUserFormat(user));
            })
            .catch((error) => {
                logger.error("updateUser", error);
                // NOT FOUND
                res.status(404).json(
                    {
                        status: 404,
                        message: "user is not found in the system"
                    }
                );
            });
    }

    registerUser(req, res) {
        if (req.body.password === req.body.confirmPassword) {
            const registerUser = req.body;
            delete registerUser.confirmPassword;
            registerUser.active = false;
            registerUser.confirmToken = randomstring.generate(12);
            UserService.addUser(registerUser)
                .then((user) => {
                    if (user) {
                        res.json({id: user._id});
                        return EmailService.sendRegisterConfirmEmail(user);
                    }
                    // CONFLICT
                    res.status(409).json(
                        {
                            status: 409,
                            message: "email is already exist"
                        }
                    );
                })
                .catch((error) => {
                    logger.error("registerUser", error);
                    res.status(500).json(
                        {
                            status: 500,
                            message: error.message
                        }
                    );
                });
        } else {
            res.status(400).json(
                {
                    status: 400,
                    message: "password and confirm password is not match"
                }
            );
        }

    }

    registerConfirm(req, res) {
        UserService.findOneAndUpdate({confirmToken: req.params.token}, {
            active: true,
            confirmToken: undefined
        })
            .then((user) => {
                if (user) {
                    res.json(UserService.briefUserFormat(user));
                } else {
                    // NOT FOUND
                    res.status(404).json(
                        {
                            status: 404,
                            message: `${req.params.token} is not found in the system`
                        }
                    );
                }
            })
            .catch((error) => {
                logger.error("registerConfirm", error);
                res.status(500).json(
                    {
                        status: 500,
                        message: error.message
                    }
                );
            });
    }
}

export default UserController;
