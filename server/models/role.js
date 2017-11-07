import mongoose, {Schema} from "mongoose";
import RSVP from "rsvp";

mongoose.Promise = RSVP.Promise;

const RoleAclSchema = new Schema({
    name: {
        type: Schema.Types.String,
        trim: true,
        required: true,
        unique: true
    },
    allows: [
        {
            resource: {
                type: Schema.Types.String,
                required: true,
                trim: true,
                unique: true
            },
            type: {
                type: Schema.Types.String,
                required: true,
                trim: true,
                enum: [
                    "API",
                    "VIEW"
                ],
                default: "API"
            },
            permissions: [
                {
                    type: Schema.Types.String,
                    trim: true,
                    unique: true
                }
            ]
        }
    ]
}, {timestamps: true});

export default mongoose.model("RoleAcl", RoleAclSchema);
