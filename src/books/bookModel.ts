import mongoose from "mongoose";
import { Book } from "./bookTypes";

const BookSchema = new mongoose.Schema<Book>({
    title: {
        required: true,
        type : String,
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    coverImage: {
        type: String,
        required: true
    },
    file: {
        type: String,
        required: true
    },
    genere: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    }
}, {timestamps : true})

export default mongoose.model<Book>("Book", BookSchema);