import { NextFunction, Request, Response } from "express";
import path from "node:path";
import cloudinary from "../config/cloudinary";
import bookModel from "./bookModel";
import createHttpError from "http-errors";
import fs from 'node:fs'


const createBook = async (req : Request, res: Response, next: NextFunction) => {
    try{
        const {title, genere} = req.body;
        console.log(req.files);

        // for upload Book cover image in cloudinary
        const files = req.files as { [fieldName: string]: Express.Multer.File[] };
        const coverImageMimeType = files.coverImage[0].mimetype.split("/").at(-1);
        const fileName = files.coverImage[0].filename;
        const filepath = path.resolve(__dirname, '../../public/data/uploads', fileName);

        const uploadResult = await cloudinary.uploader.upload(filepath, {
            filename_override : fileName,
            folder : 'book-covers',
            format : coverImageMimeType,
        })

        // for upload Book file in cloudinary
        const bookFileName = files.file[0].filename;
        const bookFilePath = path.resolve(__dirname, '../../public/data/uploads', bookFileName);

        const bookFileUploadResult = await cloudinary.uploader.upload(bookFilePath, {
            resource_type : 'raw',
            filename_override : bookFileName,
            folder: 'book-pdfs',
            format: 'pdf',
        })

        // console.log("uploadResult ", uploadResult);
        // console.log("BookFileUploadResults ", bookFileUploadResult);

        // @ts-ignore
        console.log("userId", req.userId);
        const newBook = await bookModel.create({
            title,
            genere,
            author: '6627469bc60da6ca5bf7b484',
            coverImage : uploadResult.secure_url,
            file : bookFileUploadResult.secure_url,
        })

        // Delete Temp files
        try {
            await fs.promises.unlink(filepath);
            await fs.promises.unlink(bookFilePath);
        } catch (error) {
            console.log(error);
            return next(createHttpError('500', "Error in Deleting Temp files"))
        }
        
        res.status(201).json({ id: newBook._id });
    }catch(err){
        console.log(err);
        return next(createHttpError(500, "Error in Uploading files!"))
    }
}

export {createBook}