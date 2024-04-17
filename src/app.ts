import express from 'express'
import createHttpError from 'http-errors';
import globalError from './middlewares/globalErrorHandler';


const app = express();

app.get("/", (req, res, next) => {
    const error = createHttpError(400, "something went wrong");
    throw error;
    res.json({messge : "welcome to elib api"});
})


// global error handler
app.use(globalError);

export default app;