import { NextFunction, Request, Response } from "express";


const createBook = async (req : Request, res: Response, next: NextFunction) => {


    res.status(200).json({Message: "created Book"});
}

export {createBook}