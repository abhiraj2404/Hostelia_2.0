import cloudinary from "cloudinary";
import dotenv from "dotenv";
import multer from "multer";
import path from "path";
import { Readable } from "stream";

// Ensure .env is loaded even when this module is imported before the app bootstraps
dotenv.config();

// Configure Cloudinary (fail fast if misconfigured)
const requiredEnv = [
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
];
const missing = requiredEnv.filter((k) => !process.env[ k ]);
if (missing.length > 0) {
  // Throwing here ensures misconfiguration is surfaced during boot
  throw new Error(
    `Cloudinary environment not configured. Missing: ${missing.join(", ")}`
  );
}

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Memory storage for multer (we will upload buffers directly to Cloudinary)
const memoryStorage = multer.memoryStorage();

// File filter for images (problems)
const imageFilter = (req, file, cb) => {
  const fileTypes = /jpeg|jpg|png/;
  const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = fileTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  }
  return cb(new Error("Only .png, .jpg and .jpeg format allowed!"));
};

// File filter for announcements (images and common docs)
const announcementFileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|pdf|doc|docx/;
  const extOk = allowed.test(path.extname(file.originalname).toLowerCase());
  const mimeOk = allowed.test(file.mimetype.toLowerCase());
  if (extOk && mimeOk) return cb(null, true);
  return cb(
    new Error("Unsupported file type. Allowed: jpg, jpeg, png, pdf, doc, docx")
  );
};

// File filter for fees (images and PDF)
const feeFileFilter = (req, file, cb) => {
  const allowedExts = /jpeg|jpg|png|pdf/;
  const allowedMimes = /^image\/(jpeg|jpg|png)$|^application\/pdf$/;
  const extOk = allowedExts.test(path.extname(file.originalname).toLowerCase());
  const mimeOk = allowedMimes.test(file.mimetype.toLowerCase());
  if (extOk && mimeOk) return cb(null, true);
  return cb(new Error("Only .png, .jpg, .jpeg, and .pdf format allowed!"));
};

// Multer uploaders
export const problemUpload = multer({
  storage: memoryStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: imageFilter,
});

export const announcementUpload = multer({
  storage: memoryStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: announcementFileFilter,
});

export const feeUpload = multer({
  storage: memoryStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: feeFileFilter, // Allow images (jpeg, jpg, png) and PDF
});

// Helper: convert Buffer to Readable stream
function bufferToStream(buffer) {
  const readable = new Readable();
  readable.push(buffer);
  readable.push(null);
  return readable;
}

// Helper: upload a Buffer to Cloudinary using upload_stream
export async function uploadBufferToCloudinary(buffer, options = {}) {
  const folder = options.folder || "uploads";
  const resource_type = options.resource_type || "image";
  const public_id = options.public_id;

  return new Promise((resolve, reject) => {
    const upload = cloudinary.v2.uploader.upload_stream(
      { folder, resource_type, public_id },
      (error, result) => {
        if (error) return reject(error);
        return resolve(result);
      }
    );

    bufferToStream(buffer).pipe(upload);
  });
}

// Helper: extract secure URL from Cloudinary upload result
export function getSecureUrl(uploadResult) {
  return uploadResult?.secure_url || uploadResult?.url;
}

export const cloudinaryClient = cloudinary.v2;

export default {
  cloudinary: cloudinary.v2,
  problemUpload,
  announcementUpload,
  feeUpload,
  uploadBufferToCloudinary,
  getSecureUrl,
  cloudinaryClient: cloudinary.v2,
};
