import {v2 as cloudinary} from 'cloudinary';
import { config } from './config';
          
cloudinary.config({ 
  cloud_name: config.cloudeName, 
  api_key: config.cloudinaryapikey, 
  api_secret: config.cloudinarysecretkey, 
});

export default cloudinary;