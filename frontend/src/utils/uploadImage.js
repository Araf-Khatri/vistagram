import axios from "axios";
const { VITE_CLOUDINARY_CLOUD_NAME } = import.meta.env;

const uploadImage = async (file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "vistagram_images");

    const result = await axios.post(
      `https://api.cloudinary.com/v1_1/${VITE_CLOUDINARY_CLOUD_NAME}/upload`,
      formData
    );
    return result.data.url;
  } catch (error) {
    console.error("Upload failed:", error);
    throw new Error("File not uploaded");
  }
};

export default uploadImage;
