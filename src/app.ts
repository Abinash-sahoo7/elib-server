import express from 'express'

const app = express();

app.get("/", (req, res, next) => {
    res.json({messge : "welcome to elib api"});
})

export default app;