import mongoose, {Schema} from "mongoose";

const RoleSchema = new Schema({
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
                trim: true,
                enum: [
                    "API",
                    "VIEW"
                ],
                default: "API"
            },
            operations: [
                {
                    type: Schema.Types.String,
                    trim: true,
                    required: true,
                    unique: true
                }
            ]
        }
    ]
}, {timestamps: true});

export default mongoose.model("Role", RoleSchema);
