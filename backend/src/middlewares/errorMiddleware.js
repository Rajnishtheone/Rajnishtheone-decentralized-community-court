export const errorHandler = (err, req, res, next) => {
  console.error('💥 Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // Handle different types of errors
  if (err.name === 'ValidationError') {
    const errors = Object.keys(err.errors).map(field => ({
      field: field,
      message: err.errors[field].message,
      path: [field]
    }));
    return res.status(400).json({
      message: 'Validation Error',
      errors: errors
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      message: 'Invalid ID format',
      error: 'The provided ID is not valid'
    });
  }

  if (err.code === 11000) {
    return res.status(400).json({
      message: 'Duplicate field value',
      error: 'This value already exists'
    });
  }

  // Default error response
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};
