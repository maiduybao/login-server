import log4js from "log4js";
import bcrypt from "bcrypt";
import RSVP from "rsvp";

import UserModel from "../models/user";
import RoleModel from "../models/role";


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
        return UserModel.findByIdAndUpdate(id, update, {new: true})
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
        const defer = RSVP.defer("comparePassword");
        bcrypt.compare(password, hash, (error, isMatched) => {
            if (error) {
                defer.reject(error);
            }
            defer.resolve(isMatched);
        });
        return defer.promise;
    }

}

export default new UserService();
