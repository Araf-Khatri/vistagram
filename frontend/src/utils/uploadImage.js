import { v2 as cloudinary } from "cloudinary";
const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } =
  import.meta.env;

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

const uploadImage = async (filePath) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: "posts",
      unique_filename: true,
    });

    console.log("Image URL:", result.secure_url);
  } catch (error) {
    console.error("Upload failed:", error);
  }
};

export default uploadImage;
