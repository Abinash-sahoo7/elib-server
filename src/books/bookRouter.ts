import express  from "express";
import { createBook, getAllBooks, getSingleBook, updateBook } from "./bookControllers";
import multer from "multer";
import path from 'node:path'
import authenticate from "../middlewares/authenticate";

const bookRouter = express.Router();

const upload = multer({
    dest : path.resolve(__dirname, '../../public/data/uploads'),
    // limits : {fileSize: 3e7},                                                                                                                           
    limits : {fileSize : 10000000}, // 10000000 Bytes = 10 MB},                                                                                                                                 
})

bookRouter.post("/", authenticate , upload.fields([
    {name: "coverImage", maxCount: 1},
    {name: "file", maxCount: 1},
]) , createBook);

bookRouter.post("/:bookId", authenticate , upload.fields([
    {name: "coverImage", maxCount: 1},
    {name: "file", maxCount: 1},
]) , updateBook);

bookRouter.get("/", getAllBooks);
bookRouter.get("/:bookId", getSingleBook);

export default bookRouter;