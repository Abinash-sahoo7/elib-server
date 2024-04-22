import {config as conf} from 'dotenv';
conf();

const _config = {
    port : process.env.PORT,
    mongourl : process.env.MONGO_CONNECTION_STRING,
    env: process.env.NODE_ENV,
    jwtSecret: process.env.JWT_SECRET_KEY,
};

export const config = Object.freeze(_config);