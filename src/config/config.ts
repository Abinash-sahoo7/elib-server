import {config as conf} from 'dotenv';
conf();

const _config = {
    port : process.env.PORT,
    mongourl : process.env.MONGO_CONNECTION_STRING,
    env: process.env.NODE_ENV,
    jwtSecret: process.env.JWT_SECRET_KEY,
    cloudeName: process.env.CLOUD_NAME,
    cloudinaryapikey: process.env.CLOUDINARY_API_KEY,
    cloudinarysecretkey:process.env.CLOUDINARY_SECRET_KEY,
    frontendUrl: process.env.FRONTEND_DOMAIN
};

export const config = Object.freeze(_config);