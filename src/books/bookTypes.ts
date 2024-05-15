import { User } from "../users/userTypes";

export interface Book {
    _id : string;
    title : string;
    author : User;
    genere : string;
    coverImage : string;
    file : string;
    description: String;
    createdDate : Date;
    updatedDate : Date;
}