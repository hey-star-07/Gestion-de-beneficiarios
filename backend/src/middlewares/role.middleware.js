const roleMiddleware = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        error: 'No autenticado' 
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false,
        error: 'No tienes permisos para esta acción' 
      });
    }
    
    next();
  };
};

const isOwnerOrAdmin = (req, res, next) => {
  if (req.user.role === 'ADMIN') {
    return next();
  }
  
  const beneficiaryId = req.params.id || req.params.beneficiaryId;
  
  if (req.user.beneficiaryId && 
      beneficiaryId && 
      req.user.beneficiaryId === parseInt(beneficiaryId)) {
    return next();
  }
  
  return res.status(403).json({ 
    success: false,
    error: 'Solo puedes acceder a tu propia información' 
  });
};

module.exports = { roleMiddleware, isOwnerOrAdmin };