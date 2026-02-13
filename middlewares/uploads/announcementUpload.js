import multer from "multer";

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

  if (!allowedTypes.includes(file.mimetype)) {
    cb(new Error("ONLY JPG, PNG, WEBP files are allowed"), false);
  } else {
    cb(null, true);
  }
};

const announcementImageUpload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB each
    files: 5, // MAX 5 images
  },
  fileFilter,
});

export default announcementImageUpload;
