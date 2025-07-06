export const validateBody = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        path: detail.path
      }));
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors
      });
    }
    next();
  };
};
