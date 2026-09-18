const cloudinary = require('cloudinary').v2;
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.warn('⚠️  Faltan variables de Cloudinary (CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET). Las subidas de archivos van a fallar.');
}

/**
 * Sube un buffer en memoria (lo que entrega multer con memoryStorage)
 * directo a Cloudinary, sin tocar el disco del servidor.
 *
 * @param {Buffer} buffer     req.file.buffer
 * @param {string} folder     carpeta dentro de Cloudinary (croquis | schedules)
 * @param {string} originalName  req.file.originalname, solo para logging
 * @returns {Promise<{secure_url: string, public_id: string}>}
 */
function uploadBufferToCloudinary(buffer, folder, originalName = '') {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `gestion-beneficiarios/${folder}`,
        // resource_type "auto" deja que Cloudinary detecte si es imagen
        // o PDF y arme la URL final con la extensión correspondiente
        // (necesario para que el front siga detectando "termina en .pdf").
        resource_type: 'auto'
      },
      (error, result) => {
        if (error) {
          console.error(`❌ Error subiendo "${originalName}" a Cloudinary:`, error.message);
          return reject(error);
        }
        resolve(result);
      }
    );
    stream.end(buffer);
  });
}

module.exports = { cloudinary, uploadBufferToCloudinary };