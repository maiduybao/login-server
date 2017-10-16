import mongoose, {Schema} from "mongoose";
import bcrypt from "bcrypt";
import rsvp from "rsvp";
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

const genSalt = rsvp.denodeify(bcrypt.genSalt);
const genHash = rsvp.denodeify(bcrypt.hash);


// Save user hash password when password is new or modified
UserSchema.pre("save", function (next) {
    const SALT_FACTOR = 12;
    if (this.isModified("password") || this.isNew) {
        genSalt(SALT_FACTOR)
            .then((salt) => genHash(this.password, salt))
            .then((hash) => {
                this.password = hash;
                if (this.roles.length === 0) {
                    this.roles.push("Client");
                }
                next();
            })
            .catch((error) => {
                next(error);
            });
    } else {
        return next();
    }
});

export default mongoose.model("User", UserSchema);

