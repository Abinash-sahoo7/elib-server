import { User } from "../users/userTypes";

export interface Book {
    _id : string;
    title : string;
    author : User;
    genere : string;
    coverImage : string;
    file : string;
    createdDate : Date;
    updatedDate : Date;
}