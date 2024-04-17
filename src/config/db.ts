import mongoose from 'mongoose'
import { config } from './config'

const connectDB = async () => {
    try{
        mongoose.connection.on('connected', () =>{
            console.log('Connected to database successfully');
        })

        mongoose.connection.on('error', (err) =>{
            console.log('Error occure in connect to database.', err); 
        })

        await mongoose.connect(config.mongourl as string);

    }
    catch(error){
        console.error("failed to connect with database.", error);
        process.exit(1);
    }
};

export default connectDB;