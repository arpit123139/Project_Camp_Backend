import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/images");
  },

  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`); // first parameter is the error
  },
});

export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1 * 1000 * 1000, //1MB allowed
  },
});
