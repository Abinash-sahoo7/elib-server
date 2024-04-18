import express from 'express'
import createHttpError from 'http-errors';
import globalError from './middlewares/globalErrorHandler';
import userRouter from './users/userRouter';


const app = express();
app.use(express.json());

app.get("/", (req, res, next) => {
    const error = createHttpError(400, "something went wrong");
    throw error;
    res.json({messge : "welcome to elib api"});
})

app.use("/api/users", userRouter);

// global error handler
app.use(globalError);

export default app;