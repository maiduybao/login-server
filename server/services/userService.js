import log4js from "log4js";
import bcrypt from "bcrypt";
import omit from "lodash/omit";

import UserModel from "../models/user";


const logger = log4js.getLogger("UserService");

class UserService {

    getUserById(id) {
        return UserModel.findById(id)
            .populate("roles")
            .lean()
            .exec()
            .catch((error) => {
                logger.error("getUserById", error);
                throw error;
            });
    }

    getUserByEmail(email) {
        return UserModel.findOne({email})
            .populate("roles")
            .lean()
            .exec()
            .catch((error) => {
                logger.error("getUserByEmail", error);
                throw error;
            });
    }

    updateUser(id, update) {
        return UserModel.findByIdAndUpdate(id, {$set: update}, {new: true})
            .populate("roles")
            .lean()
            .exec()
            .catch((error) => {
                logger.error("updateUser", error);
                throw error;
            });
    }

    addUser(user) {
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

    getUsers() {
        return UserModel.find()
            .populate("roles")
            .lean()
            .exec()
            .catch((error) => {
                logger.error("getUsers", error);
                throw error;
            });
    }

    comparePassword(password, hash) {
        return new Promise((resolve, reject) => {
            bcrypt.compare(password, hash, (error, isMatched) => {
                if (error) {
                    reject(error);
                }
                resolve(isMatched);
            });
        });
    }

    findOneAndUpdate(criteria, update) {
        return UserModel.findOneAndUpdate(criteria, {$set: update}, {new: true})
            .populate("roles")
            .lean()
            .exec()
            .catch((error) => {
                logger.error("updateUser", error);
                throw error;
            });
    }

    briefUserFormat(user) {
        const {_id: id, roles, ...rest} = user;
        const others = omit(rest, ["password", "active", "confirmToken", "__v"]);
        return {
            id,
            ...others,
            roles: roles.map((role) => role.name)
        };
    }
}

export default new UserService();
