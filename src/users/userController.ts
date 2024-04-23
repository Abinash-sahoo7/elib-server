import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import userModel from "./userModel";
import bcrypt from 'bcrypt';
import { sign } from "jsonwebtoken";
import { config } from "../config/config";
import { User } from "./userTypes";


const createUser = async (req : Request, res: Response, next: NextFunction) => {
    const {name, email, password} = req.body;
    // Validation 
    if(!name || !email || !password){
        const error = createHttpError(400, "All fields are required");
        return next(error);
    }
    // Database call cheack user present or not
    try{
        const user = await userModel.findOne({email});
        if(user){
            const error = createHttpError(400, "User Already exist");
            return next(error);
        }
    }
    catch(err){       
        return next(createHttpError(500, "Error While creating User"));
    }
    
    // Password Hash using bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    let newUser : User;

    try {
        newUser = await userModel.create({
            name,
            email,
            password : hashedPassword,
        })
    } catch (error) {
        return next(createHttpError(500, "Error While creating User"));
    }

    //Jwt token 
    try {
        const token = sign({sub: newUser._id}, config.jwtSecret as string, {expiresIn: '1h'});

        res.status(201).json({ accessToken : token });
    } catch (error) {
        return next(createHttpError(500, "Error While creating Token"));
    }

}

const loginUser = async(req : Request, res: Response, next: NextFunction) => {

    const {email, password} = req.body;
    if(!email || !password){
        return next(createHttpError(400, "All fields are Required"));
    }
    
    const user = await userModel.findOne({ email });
    if(!user){
        return next(createHttpError(404, "User Not Found!"));
    }  

    try {
        const isMatched = await bcrypt.compare(password, user.password);

        if(!isMatched){
            return next(createHttpError(400, "Email or password is Incorrect!"));
        }
    } catch (error) {
        return next(createHttpError(400, "Error in Login!"));
    }
    
    try {
        const token = sign({sub: user._id}, config.jwtSecret as string, {expiresIn: '1h'});
    
        res.status(200).json({accessToken : token});
    } catch (error) {
        return next(createHttpError(400, "Error in Login!"));
    }
}

export {createUser, loginUser}