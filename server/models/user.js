import mongoose, {Schema} from "mongoose";
import bcrypt from "bcrypt";
// import log4js from "log4js";

// const logger = log4js.getLogger("models.user");
const UserSchema = new Schema({
    email: {
        type: String,
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
            type: String,
            enum: [
                "Client",
                "Manager",
                "Admin"
            ],
            default: "Client",
            trim: true
        }
    ],
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    }
}, {timestamps: true});

// Save user hash password when password is new or modified
UserSchema.pre("save", function (next) {
    const SALT_FACTOR = 12;
    if (this.isModified("password") || this.isNew) {
        bcrypt.genSalt(SALT_FACTOR, (error1, salt) => {
            if (error1) {
                return next(error1);
            }
            bcrypt.hash(this.password, salt, (error2, hash) => {
                if (error2) {
                    return next(error2);
                }
                this.password = hash;
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

