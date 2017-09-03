import mongoose, {Schema} from "mongoose";
import bcrypt from "bcrypt";
import log4js from "log4js";

const logger = log4js.getLogger("models.user");
const UserSchema = new Schema({
    email: {
        type: String,
        lowercase: true,
        unique: true,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    roles: [
        {
            type: String,
            enum: [
                "Client",
                "Manager",
                "Admin"
            ],
            default: "Client",
        }
    ],
});

// Save user hash password
UserSchema.pre("save", function (next) {
    if (this.isModified("password") || this.isNew) {
        bcrypt.genSalt(10, (error1, salt) => {
            if (error1) {
                return next(error1);
            }
            bcrypt.hash(this.password, salt, (error2, hash) => {
                if (error2) {
                    return next(error2);
                }
                this.password = hash;
                logger.debug(`hash=${hash}`);
                next();
            });
        });

        if (this.roles.length === 0) {
            this.roles.push("Client");
        }
    } else {
        return next();
    }
});

// create a method for compare password
UserSchema.methods.comparePassword = function (hashedPassword, callback) {
    bcrypt.compare(hashedPassword, this.password, (error, isMath) => {
        if (error) {
            return callback(error);
        }
        return callback(null, isMath);
    });
};

export default mongoose.model("User", UserSchema);

