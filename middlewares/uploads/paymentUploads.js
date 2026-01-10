import multer from "multer";

const storage = multer.memoryStorage(); // store file in memory as buffer

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png"];
  if (!allowedTypes.includes(file.mimetype)) {
    cb(new Error("ONLY JPG and PNG files are allowed"), false);
  } else {
    cb(null, true);
  }
};

const paymentUpload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 5MB
  },
  fileFilter,
});

export default paymentUpload;
