import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import jwt from "jsonwebtoken";
import { config } from "../config/config";

export interface AuthRequest extends Request{
    userId : string;
}

const authenticate = async (req : Request, res: Response, next: NextFunction) => {
    const token = req.header('Authorization');

    if(!token){
        return next(createHttpError(401, "Authorization token is required"));
    }

    
    try {
        const parseToken = token.split(" ")[1];
        const decode = jwt.verify(parseToken, config.jwtSecret as string);
        // console.log("Decode", decode);
        const _req = req as AuthRequest;
        _req.userId = decode.sub as string;

        next();
    } catch (error) {
        return next(createHttpError(401, "Token is Expired"));
    }
    
}

export default authenticate;