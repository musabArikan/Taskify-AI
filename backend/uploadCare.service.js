import dotenv from "dotenv";
import fetch from "node-fetch";
import FormData from "form-data";
dotenv.config();

export const uploadFile = async (fileBuffer, fileName) => {
  try {
    const formData = new FormData();

    formData.append("UPLOADCARE_PUB_KEY", process.env.UPLOADCARE_PUBLIC_KEY);
    formData.append("UPLOADCARE_STORE", "auto");
    formData.append("file", fileBuffer, {
      filename: fileName,
      contentType: "image/jpeg",
    });

    console.log("Uploading file:", fileName);
    console.log("Using Public Key:", process.env.UPLOADCARE_PUBLIC_KEY);

    const response = await fetch("https://upload.uploadcare.com/base/", {
      method: "POST",
      body: formData,
    });

    const responseData = await response.json();
    console.log("UploadCare Response:", JSON.stringify(responseData, null, 2));

    if (responseData.error) {
      throw new Error(`Upload failed: ${responseData.error.content}`);
    }

    if (!responseData.file) {
      throw new Error("No file UUID received");
    }

    return {
      cdnUrl: `https://ucarecdn.com/${responseData.file}/`,
      uuid: responseData.file,
    };
  } catch (error) {
    console.error("UploadCare upload error:", error);
    throw new Error("File upload failed");
  }
};
