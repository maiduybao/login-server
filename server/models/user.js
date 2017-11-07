import mongoose, {Schema} from "mongoose";
import BCRYPT from "bcrypt";
import RSVP from "rsvp";
import RoleAclModel from "./role";
import log4js from "log4js";

const logger = log4js.getLogger("models.user");
mongoose.Promise = RSVP.Promise;

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
            ref: "RoleAcl",
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
    }
}, {timestamps: true});

const genSalt = RSVP.denodeify(BCRYPT.genSalt);
const genHash = RSVP.denodeify(BCRYPT.hash);


// Save user hash password when password is new or modified
UserSchema.pre("save", function (next) {
    const SALT_FACTOR = 12;
    if (this.isModified("password") || this.isNew) {
        genSalt(SALT_FACTOR)
            .then((salt) => genHash(this.password, salt))
            .then((hash) => {
                this.password = hash;
                if (this.roles.length === 0) {
                    RoleAclModel.findOne({name: "Client"})
                        .lean()
                        .exec()
                        .then((role) => {
                            this.roles.push(role);
                            next();
                        })
                        .catch((error) => {
                            logger.error("RoleAclModel", error);
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

