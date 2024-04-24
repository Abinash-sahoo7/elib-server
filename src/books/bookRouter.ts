import express  from "express";
import { createBook } from "./bookControllers";
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

export default bookRouter;