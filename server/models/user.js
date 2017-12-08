import mongoose, {Schema} from "mongoose";

import BCRYPT from "bcrypt";
import RoleModel from "./role";
import log4js from "log4js";
import util from "util";

const logger = log4js.getLogger("models.user");

const UserSchema = new Schema({
    email: {
        type: Schema.Types.String,
        lowercase: true,
        unique: true,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    roles: [
        {
            type: Schema.Types.ObjectId,
            ref: "Role",
            required: true
        }
    ],
    firstName: {
        type: Schema.Types.String,
        required: true,
        trim: true
    },
    lastName: {
        type: Schema.Types.String,
        required: true,
        trim: true
    },
    active: {
        type: Schema.Types.Boolean,
        default: false
    },
    confirmToken: {type: Schema.Types.String}
}, {timestamps: true});

const genSalt = util.promisify(BCRYPT.genSalt);
const genHash = util.promisify(BCRYPT.hash);

// Save user hash password when password is new or modified
UserSchema.pre("save", function (next) {
    const SALT_FACTOR = 12;
    if (this.isModified("password") || this.isNew) {
        genSalt(SALT_FACTOR)
            .then((salt) => genHash(this.password, salt))
            .then((hash) => {
                this.password = hash;
                if (this.roles.length === 0) {
                    RoleModel.findOne({name: "Client"})
                        .lean()
                        .exec()
                        .then((role) => {
                            this.roles.push(role);
                            next();
                        })
                        .catch((error) => {
                            logger.error("RoleModel", error);
                            throw error;
                        });
                } else {
                    return next();
                }
            })
            .catch((error) => {
                next(error);
            });
    } else {
        return next();
    }
});

export default mongoose.model("User", UserSchema);

