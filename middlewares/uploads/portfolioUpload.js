import multer from "multer";

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
  ];

  if (!allowedTypes.includes(file.mimetype)) {
    cb(
      new Error("ONLY JPG, PNG, WEBP files are allowed"),
      false
    );
  } else {
    cb(null, true);
  }
};

const portfolioImageUpload = multer({
  storage,
  limits: {
    fileSize: 8 * 1024 * 1024, // 8MB (portfolio images bigger)
    files: 3,                 // MAX 3 images
  },
  fileFilter,
});

export default portfolioImageUpload;
