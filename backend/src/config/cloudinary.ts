import { v2 as cloudinary } from 'cloudinary';
import 'dotenv/config';

if (!process.env.CLOUDINARY_CLOUD_NAME) {
  throw new Error('CLOUDINARY_CLOUD_NAME is missing in .env');
}

if (!process.env.CLOUDINARY_API_KEY) {
  throw new Error('CLOUDINARY_API_KEY is missing in .env');
}

if (!process.env.CLOUDINARY_API_SECRET) {
  throw new Error('CLOUDINARY_API_SECRET is missing in .env');
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;
