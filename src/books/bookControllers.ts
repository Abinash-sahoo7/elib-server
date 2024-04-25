import { NextFunction, Request, Response } from "express";
import path from "node:path";
import cloudinary from "../config/cloudinary";
import bookModel from "./bookModel";
import createHttpError from "http-errors";
import fs from 'node:fs'
import { AuthRequest } from "../middlewares/authenticate";


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
        const _req = req as AuthRequest;
        const newBook = await bookModel.create({
            title,
            genere,
            author: _req.userId,
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

const updateBook = async (req : Request, res: Response, next: NextFunction) => {
    try {
        const {title, genere} = req.body;
        const bookId = req.params.bookId;

        const book = await bookModel.findOne({ _id : bookId});

        if(!book){
            return next(createHttpError(404, "Book not found"));
        }

        const _req = req as AuthRequest;
        if(book.author.toString() != _req.userId){
            return next(createHttpError(403, "UnAuthorized"));   
        }

        const files = req.files as { [fieldName: string]: Express.Multer.File[] };
        let completeCoverImage = '';
        if(files.coverImage){
            const fileName = files.coverImage[0].filename;
            const coverImageMimetype = files.coverImage[0].mimetype.split("/").at(-1);
            const filePath = path.resolve(__dirname, '../../public/data/uploads', fileName);
            completeCoverImage = fileName;

            const uploadresult = await cloudinary.uploader.upload(filePath, {
                filename_override: fileName,
                folder: "book-covers",
                format : coverImageMimetype,
            });

            completeCoverImage = uploadresult.secure_url;
            await fs.promises.unlink(filePath);
        }

        let completBookFilePath = '';
        if(files.file){
            const bookFileName = files.file[0].filename;
            // const bookMimetype = files.file[0].mimetype.split("/").at(-1);
            const bookFilePath = path.resolve(__dirname, '../../public/data/uploads', bookFileName);
            completeCoverImage = bookFileName;

            const uploadBookresult = await cloudinary.uploader.upload(bookFilePath, {
                resource_type: 'raw',
                filename_override: bookFileName,
                folder: "book-pdfs",
                format : 'pdf',
            });

            completeCoverImage = uploadBookresult.secure_url;
            await fs.promises.unlink(bookFilePath);
        }

        const updatedBook =await bookModel.findOneAndUpdate(
            {
                _id: bookId,
            },
            {
                title: title,
                genere: genere,
                coverImage: completeCoverImage ? completeCoverImage : book.coverImage,
                file: completBookFilePath ? completBookFilePath : book.file,
            },
            {
                new: true
            }
        )
       
        res.status(200).send(updatedBook);
    } catch (error) {
        console.log(error);
        return next(createHttpError(500, "Error while updating Book"));
    }
    
} 

const getAllBooks = async (req : Request, res: Response, next: NextFunction) => {
    try {
        const books = await bookModel.find();
        return res.status(200).json(books);
    } catch (error) {
        console.log(error);
        return next(createHttpError(400, "Error while get all Book list"))
    }
}

export {createBook, updateBook, getAllBooks}