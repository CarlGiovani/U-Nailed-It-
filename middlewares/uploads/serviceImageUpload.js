import multer from "multer";

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png"];
  if (!allowedTypes.includes(file.mimetype)) {
    cb(new Error("ONLY JPG, PNG, WEBP files are allowed"), false);
  } else {
    cb(null, true);
  }
};

const serviceImageUpload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB (services usually smaller)
  },
  fileFilter,
});

export default serviceImageUpload;
