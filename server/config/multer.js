const multer = require('multer');
const fs = require('fs');
const path = require('path');

fs.mkdir(path.resolve(`${__dirname}/../pictures`), (err) => {
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.resolve(`${__dirname}/../pictures/`));
  },
  filename: (req, file, cb) => {
    cb(null, `${req.params.id}.jpg`);
  },
});

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb('Please upload only images.', false);
  }
};

const upload = multer({
  storage,
  fileFilter : multerFilter,
  limits: {
    fieldSize: 250 * 1024 * 1024,
  },
});

module.exports = upload;
