import express  from "express";
import { createBook } from "./bookControllers";

const bookRouter = express.Router();

bookRouter.post("/", createBook);