import log4js from "log4js";
import bcrypt from "bcrypt";
import rsvp from "rsvp";

import UserModel from "../models/user";

const logger = log4js.getLogger("UserService");

class UserService {

    getUserById(id) {
        return UserModel.findById(id)
        .lean()
        .exec()
        .then((user) => user)
        .catch((error) => {
            logger.error("getUserById", error);
            throw error;
        });
    }

    getUserByEmail(email) {
        return UserModel.findOne({email})
        .lean()
        .exec()
        .then((user) => user)
        .catch((error) => {
            logger.error("getUserByEmail", error);
            throw error;
        });
    }

    updateUser(id, update) {
        return UserModel.findByIdAndUpdate(id, update)
        .lean()
        .exec()
        .then((updated) => updated)
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
            userModel.save();
            return userModel.toJson();
        })
        .catch((error) => {
            logger.error("addUser", error);
            throw error;
        });
    }

    getUsers() {
        return UserModel.find()
        .lean()
        .exec()
        .then((users) => users)
        .catch((error) => {
            logger.error("getUsers", error);
            throw error;
        });
    }

    comparePassword(password, hash) {
        const defer = rsvp.defer("comparePassword");
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
