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
  
  tags: Joi.array().items(Joi.string().max(50)).max(10)
});

export const targetResponseSchema = Joi.object({
  response: Joi.string().min(10).max(2000).required()
    .messages({
      'string.min': 'Response must be at least 10 characters long',
      'string.max': 'Response cannot exceed 2000 characters',
      'any.required': 'Response is required'
    })
});
