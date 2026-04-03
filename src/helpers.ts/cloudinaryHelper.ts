import { v2 as cloudinary } from "cloudinary";
import { config } from "../config/index.js";
import fs from "fs";

cloudinary.config({
  cloud_name: config.cloudinary.name,
  api_key: config.cloudinary.key,
  api_secret: config.cloudinary.secret,
});

/**
 * Uploads a file to Cloudinary and deletes it from local storage afterward
 */
export const uploadToCloudinary = async (filePath: string, folder: string = "lukeattisha") => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: folder,
    });
    // Delete file from local storage
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    return result.secure_url;
  } catch (error) {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    console.error("Cloudinary Upload Error:", error);
    throw error;
  }
};

export const CloudinaryHelper = {
  uploadToCloudinary,
};
