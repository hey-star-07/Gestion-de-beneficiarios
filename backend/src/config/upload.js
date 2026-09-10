const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Ruta de uploads fuera del backend
const UPLOAD_ROOT = path.join(__dirname, '../../../uploads');

// Crear directorios si no existen
const uploadDirs = [
  path.join(UPLOAD_ROOT, 'croquis'),
  path.join(UPLOAD_ROOT, 'schedules'),
  path.join(UPLOAD_ROOT, 'maps')
];

uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log('📁 Directorio creado:', dir);
  }
});

// Configuración de almacenamiento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = path.join(UPLOAD_ROOT, 'croquis');
    
    if (file.fieldname === 'schedule_file') {
      uploadPath = path.join(UPLOAD_ROOT, 'schedules');
    } else if (file.fieldname === 'croquis_file') {
      uploadPath = path.join(UPLOAD_ROOT, 'croquis');
    } else if (file.fieldname === 'map_file') {
      uploadPath = path.join(UPLOAD_ROOT, 'maps');
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// Filtro de archivos
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de archivo no permitido. Solo PDF, JPEG y PNG'), false);
  }
};

// Configuración de multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 5
  }
});

module.exports = { upload, UPLOAD_ROOT };