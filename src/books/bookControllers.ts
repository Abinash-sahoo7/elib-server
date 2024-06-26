import { NextFunction, Request, Response } from "express";
import path, { parse } from "node:path";
import cloudinary from "../config/cloudinary";
import bookModel from "./bookModel";
import createHttpError from "http-errors";
import fs from "node:fs";
import { AuthRequest } from "../middlewares/authenticate";

const createBook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, genere, description } = req.body;
    console.log(req.files);

    // for upload Book cover image in cloudinary
    const files = req.files as { [fieldName: string]: Express.Multer.File[] };
    const coverImageMimeType = files.coverImage[0].mimetype.split("/").at(-1);
    const fileName = files.coverImage[0].filename;
    const filepath = path.resolve(
      __dirname,
      "../../public/data/uploads",
      fileName
    );

    const uploadResult = await cloudinary.uploader.upload(filepath, {
      filename_override: fileName,
      folder: "book-covers",
      format: coverImageMimeType,
    });

    // for upload Book file in cloudinary
    const bookFileName = files.file[0].filename;
    const bookFilePath = path.resolve(
      __dirname,
      "../../public/data/uploads",
      bookFileName
    );

    const bookFileUploadResult = await cloudinary.uploader.upload(
      bookFilePath,
      {
        resource_type: "raw",
        filename_override: bookFileName,
        folder: "book-pdfs",
        format: "pdf",
      }
    );

    // console.log("uploadResult ", uploadResult);
    // console.log("BookFileUploadResults ", bookFileUploadResult);

    // @ts-ignore
    console.log("userId", req.userId);
    const _req = req as AuthRequest;
    const newBook = await bookModel.create({
      title,
      genere,
      description,
      author: _req.userId,
      coverImage: uploadResult.secure_url,
      file: bookFileUploadResult.secure_url,
    });

    // Delete Temp files
    try {
      await fs.promises.unlink(filepath);
      await fs.promises.unlink(bookFilePath);
    } catch (error) {
      console.log(error);
      return next(createHttpError("500", "Error in Deleting Temp files"));
    }

    res.status(201).json({ id: newBook._id });
  } catch (err) {
    console.log(err);
    return next(createHttpError(500, "Error in Uploading files!"));
  }
};

const updateBook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, genere, description } = req.body;
    console.log(req.files);
    const bookId = req.params.bookId;

    const book = await bookModel.findOne({ _id: bookId });

    if (!book) {
      return next(createHttpError(404, "Book not found"));
    }

    const _req = req as AuthRequest;
    if (book.author.toString() != _req.userId) {
      return next(
        createHttpError(
          403,
          "UnAuthorized OOPs You Are Not Able to Update the Book!"
        )
      );
    }

    const files = req.files as { [fieldName: string]: Express.Multer.File[] };
    let completeCoverImage = "";
    if (files.coverImage) {
      // Delete the extising coverImage from Cloudinary
      const bookCoverImageSplit = book.coverImage.split("/");
      // https://res.cloudinary.com/diljbhage/image/upload/v1715014842/book-covers/c8x5n8ok8pwpzayiory8.jpg
      const bookCoverImagePublicId =
        bookCoverImageSplit.at(-2) +
        "/" +
        bookCoverImageSplit.at(-1)?.split(".").at(-2);
      console.log("bookCoverImagePublicId : " + bookCoverImagePublicId);
      await cloudinary.uploader.destroy(bookCoverImagePublicId);

      const fileName = files.coverImage[0].filename;
      const coverImageMimetype = files.coverImage[0].mimetype.split("/").at(-1);
      const filePath = path.resolve(
        __dirname,
        "../../public/data/uploads",
        fileName
      );
      completeCoverImage = fileName;

      const uploadresult = await cloudinary.uploader.upload(filePath, {
        filename_override: fileName,
        folder: "book-covers",
        format: coverImageMimetype,
      });

      completeCoverImage = uploadresult.secure_url;
      console.log("completeCoverImage: " + completeCoverImage);
      await fs.promises.unlink(filePath);
    }

    let completBookFilePath = "";
    if (files.file) {
      // Delete the extising book-File from Cloudinary
      const bookpdfSplit = book.file.split("/");
      const bookpdfPublicId = bookpdfSplit.at(-2) + "/" + bookpdfSplit.at(-1);
      console.log("bookpdfPublicId: " + bookpdfPublicId);
      await cloudinary.uploader.destroy(bookpdfPublicId, {
        resource_type: "raw",
      });

      const bookFileName = files.file[0].filename;
      // const bookMimetype = files.file[0].mimetype.split("/").at(-1);
      const bookFilePath = path.resolve(
        __dirname,
        "../../public/data/uploads",
        bookFileName
      );
      completBookFilePath = bookFileName;

      const uploadBookresult = await cloudinary.uploader.upload(bookFilePath, {
        resource_type: "raw",
        filename_override: bookFileName,
        folder: "book-pdfs",
        format: "pdf",
      });

      completBookFilePath = uploadBookresult.secure_url;
      console.log("completBookFilePath: " + completBookFilePath);
      await fs.promises.unlink(bookFilePath);
    }

    const updatedBook = await bookModel.findOneAndUpdate(
      {
        _id: bookId,
      },
      {
        title: title,
        genere: genere,
        description: description,
        coverImage: completeCoverImage ? completeCoverImage : book.coverImage,
        file: completBookFilePath ? completBookFilePath : book.file,
      },
      {
        new: true,
      }
    );

    res.status(200).send(updatedBook);
  } catch (error) {
    console.log(error);
    return next(createHttpError(500, "Error while updating Book"));
  }
};

const getAllBooks = async (req: Request, res: Response, next: NextFunction) => {
  let page = parseInt(req.query.page as string) || 1;
  if (page === 0) page = 1;
  // : (page = parseInt(req.query.page as string) || 1);
  console.log("page : ", page);

  const limit = parseInt(req.query.limit as string) || 10;
  try {
    const books = await bookModel
      .find()
      .populate("author", "name")
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();
    const totalCount = await bookModel.countDocuments();
    return res.status(200).json({
      CurrentPage: page,
      TotalCount: totalCount,
      books,
    });
  } catch (error) {
    console.log(error);
    return next(createHttpError(500, "Error while get all Book list"));
  }
};

const getSingleBook = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const bookId = req.params.bookId;

    const book = await bookModel
      .findOne({ _id: bookId })
      .populate("author", "name");
    if (!book) {
      return next(createHttpError(400, "Book Not Found!"));
    }

    return res.status(200).json(book);
  } catch (error) {
    console.log(error);
    return next(createHttpError(500, "Error while get single book"));
  }
};

const deleteBook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bookId = req.params.bookId;

    const book = await bookModel.findOne({ _id: bookId });

    if (!book) {
      return next(createHttpError(400, "Book not found"));
    }

    const _req = req as AuthRequest;
    if (book.author.toString() != _req.userId) {
      return next(createHttpError(403, "UnAuthorized"));
    }

    // https://res.cloudinary.com/diljbhage/image/upload/v1714046621/book-covers/smmbc3jajktlrodjc5ab.png
    // book-covers/ckjsaqynomdjtsq3gj6m
    const bookCoverImageSplit = book.coverImage.split("/");
    const bookCoverImagePublicId =
      bookCoverImageSplit.at(-2) +
      "/" +
      bookCoverImageSplit.at(-1)?.split(".").at(-2);

    const bookpdfSplit = book.file.split("/");
    const bookpdfPublicId = bookpdfSplit.at(-2) + "/" + bookpdfSplit.at(-1);
    console.log("bookCoverImagePublicId : " + bookpdfPublicId);

    await cloudinary.uploader.destroy(bookCoverImagePublicId);
    await cloudinary.uploader.destroy(bookpdfPublicId, {
      resource_type: "raw",
    });

    await bookModel.deleteOne({ _id: bookId });

    return res.sendStatus(204);
  } catch (error) {
    console.log(error);
    return next(createHttpError(500, "error occure while Delete book"));
  }
};
export { createBook, updateBook, getAllBooks, getSingleBook, deleteBook };
