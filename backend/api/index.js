// Vercel detecta automáticamente cualquier archivo bajo /api como una
// función serverless. Una app de Express es en sí misma un handler
// válido de (req, res) => {...}, así que exportarla directo alcanza:
// no hace falta envolverla en nada más.
module.exports = require('../src/app');