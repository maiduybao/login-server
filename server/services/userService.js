import log4js from "log4js";

import UserModel from "../models/user";

const logger = log4js.getLogger("userService");

class UserService {

    getUserById (guid) {
        return UserModel.findById(guid).exec()
        .then((user) => user)
        .catch((error) => {
            logger.error("getUserById", error);
            throw error;
        });
    }

    getUserByEmail (email) {
        return UserModel.findOne({email}).exec()
        .then((user) => user)
        .catch((error) => {
            logger.error("getUserByEmail", error);
            throw error;
        });
    }

    updateUser (user) {
        return user.save();
    }

    addUser (user) {
        return this.getUserByEmail(user.email)
        .then((found) => {
            if (found) {
                return false;
            }
            const userModel = new UserModel(user);
            return userModel.save();
        })
        .catch((error) => {
            logger.error("addUser", error);
            throw error;
        });
    }

}

export default new UserService();
