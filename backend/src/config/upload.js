const multer = require('multer');

// Antes multer escribía a disco (backend/src/config/upload.js original).
// Ahora los archivos se quedan en memoria como Buffer (req.file.buffer)
// y de ahí se suben directo a Cloudinary — el backend ya no depende de
// ningún disco persistente ni de UPLOAD_PATH.
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de archivo no permitido. Solo PDF, JPEG y PNG'), false);
  }
};

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 5 * 1024 * 1024,
    files: 5
  }
});

module.exports = { upload };