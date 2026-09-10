const upload = require('../config/upload');

const uploadMiddleware = {
  single: (fieldName) => {
    return (req, res, next) => {
      upload.single(fieldName)(req, res, (err) => {
        if (err) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
              success: false,
              error: 'Archivo demasiado grande. Máximo 5MB'
            });
          }
          
          return res.status(400).json({
            success: false,
            error: err.message || 'Error al subir archivo'
          });
        }
        
        next();
      });
    };
  },
  
  multiple: (fields) => {
    return (req, res, next) => {
      upload.fields(fields)(req, res, (err) => {
        if (err) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
              success: false,
              error: 'Archivo demasiado grande. Máximo 5MB'
            });
          }
          
          return res.status(400).json({
            success: false,
            error: err.message || 'Error al subir archivos'
          });
        }
        
        next();
      });
    };
  }
};

module.exports = uploadMiddleware;