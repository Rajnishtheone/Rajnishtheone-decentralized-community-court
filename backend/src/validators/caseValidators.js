import Joi from 'joi';

export const createCaseSchema = Joi.object({
  title: Joi.string().min(5).max(200).required()
    .messages({
      'string.min': 'Title must be at least 5 characters long',
      'string.max': 'Title cannot exceed 200 characters',
      'any.required': 'Title is required'
    }),
  
  description: Joi.string().min(10).max(2000).required()
    .messages({
      'string.min': 'Description must be at least 10 characters long',
      'string.max': 'Description cannot exceed 2000 characters',
      'any.required': 'Description is required'
    }),
  
  category: Joi.string().valid('Civil', 'Criminal', 'Property', 'Family', 'Business', 'Noise', 'Parking', 'Maintenance', 'Security', 'Other')
    .default('Other'),
  
  priority: Joi.string().valid('Low', 'Medium', 'High', 'Urgent')
    .default('Medium'),
  
  tags: Joi.array().items(Joi.string().max(50)).max(10),
  
  // ✅ NEW: Optional target information
  targetName: Joi.string().max(100).optional(),
  targetEmail: Joi.string().email().optional(),
  targetPhone: Joi.string().pattern(/^[0-9]{10}$/).optional(),
  targetBuilding: Joi.string().max(100).optional(),
  targetFlat: Joi.string().max(50).optional(),
  physicalDescription: Joi.string().max(500).optional(),
  location: Joi.string().max(200).optional(),
  timeOfIncident: Joi.string().max(100).optional(),
  frequency: Joi.string().max(100).optional(),
  
  // ✅ LEGACY: Keep for backward compatibility
  filedAgainst: Joi.string().length(24).optional()
});

export const verifyCaseSchema = Joi.object({
  verifiedTargetId: Joi.string().length(24).when('action', {
    is: 'verify',
    then: Joi.required(),
    otherwise: Joi.optional()
  }),
  verificationNotes: Joi.string().max(1000).optional(),
  action: Joi.string().valid('verify', 'reject').required()
});

export const targetResponseSchema = Joi.object({
  response: Joi.string().min(10).max(2000).required()
    .messages({
      'string.min': 'Response must be at least 10 characters long',
      'string.max': 'Response cannot exceed 2000 characters',
      'any.required': 'Response is required'
    })
});
