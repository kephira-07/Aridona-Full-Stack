import {v2 as cloudinary} from 'cloudinary';

const connectCloudinary = async () => {
    cloudinary.config({
        cloud_name: (process.env.CLOUDINARY_NAME || '').trim(),
        api_key: (process.env.CLOUDINARY_API_KEY || '').trim(),
        api_secret: (process.env.CLOUDINARY_API_SECRET || '').trim(),
        secure: true,
        timeout: 120000,
    });
};
export default connectCloudinary;