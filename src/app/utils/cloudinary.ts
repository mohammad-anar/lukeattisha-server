import { v2 as cloudinary } from 'cloudinary';
import { config } from '../../config/index.js';

cloudinary.config({
  cloud_name: config.cloudinary.name,
  api_key: config.cloudinary.key,
  api_secret: config.cloudinary.secret,
});

export const sendToCloudinary = async (file: any) => {
  const response = await cloudinary.uploader.upload(file.path, {
    folder: 'laundry_platform',
    resource_type: 'auto',
  });
  return response.secure_url;
};

export const CloudinaryUtils = {
  sendToCloudinary,
};
