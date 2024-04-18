import { User } from "./userTypes";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema<User>({
    name: {
        type: String,
        require: true,
    },
    email: {
        type: String,
        required : true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
}, 
    {timestamps: true}
)

export default mongoose.model("User", userSchema);