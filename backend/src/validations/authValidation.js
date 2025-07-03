const Joi = require('joi');

// Registration validation schema
const registerSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.min': 'Name must be at least 2 characters long',
      'string.max': 'Name cannot exceed 50 characters',
      'any.required': 'Name is required',
      'string.empty': 'Name cannot be empty'
    }),
  
  email: Joi.string()
    .email()
    .lowercase()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
      'string.empty': 'Email cannot be empty'
    }),
  
  password: Joi.string()
    .min(8)
    .max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/)
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters long',
      'string.max': 'Password cannot exceed 128 characters',
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      'any.required': 'Password is required',
      'string.empty': 'Password cannot be empty'
    }),
  
  confirmPassword: Joi.string()
    .valid(Joi.ref('password'))
    .required()
    .messages({
      'any.only': 'Passwords do not match',
      'any.required': 'Password confirmation is required',
      'string.empty': 'Password confirmation cannot be empty'
    }),
  
  role: Joi.string()
    .valid('user', 'teacher')
    .default('user')
    .messages({
      'any.only': 'Role must be either user or teacher'
    }),
  
  preferences: Joi.object({
    difficulty: Joi.string()
      .valid('beginner', 'intermediate', 'advanced')
      .default('beginner'),
    topics: Joi.array().items(Joi.string().trim()),
    notifications: Joi.object({
      email: Joi.boolean().default(true),
      push: Joi.boolean().default(true),
      reminders: Joi.boolean().default(true)
    }).default(),
    language: Joi.string().default('en'),
    timezone: Joi.string().default('UTC')
  }).default()
});

// Login validation schema
const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .lowercase()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
      'string.empty': 'Email cannot be empty'
    }),
  
  password: Joi.string()
    .min(8)
    .max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/)
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters long',
      'string.max': 'Password cannot exceed 128 characters',
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      'any.required': 'Password is required',
      'string.empty': 'Password cannot be empty'
    }),
  
  rememberMe: Joi.boolean()
    .default(false)
    .messages({
      'boolean.base': 'Remember me must be a boolean value'
    })
});

// Forgot password validation schema
const forgotPasswordSchema = Joi.object({
  email: Joi.string()
    .email()
    .lowercase()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
      'string.empty': 'Email cannot be empty'
    })
});

// Reset password validation schema
const resetPasswordSchema = Joi.object({
  token: Joi.string()
    .required()
    .messages({
      'any.required': 'Reset token is required',
      'string.empty': 'Reset token cannot be empty'
    }),
  
  password: Joi.string()
    .min(8)
    .max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/)
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters long',
      'string.max': 'Password cannot exceed 128 characters',
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      'any.required': 'Password is required',
      'string.empty': 'Password cannot be empty'
    }),
  
  confirmPassword: Joi.string()
    .valid(Joi.ref('password'))
    .required()
    .messages({
      'any.only': 'Passwords do not match',
      'any.required': 'Password confirmation is required',
      'string.empty': 'Password confirmation cannot be empty'
    })
});

// Change password validation schema
const changePasswordSchema = Joi.object({
  currentPassword: Joi.string()
    .required()
    .messages({
      'any.required': 'Current password is required',
      'string.empty': 'Current password cannot be empty'
    }),
  
  newPassword: Joi.string()
    .min(8)
    .max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/)
    .required()
    .messages({
      'string.min': 'New password must be at least 8 characters long',
      'string.max': 'New password cannot exceed 128 characters',
      'string.pattern.base': 'New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      'any.required': 'New password is required',
      'string.empty': 'New password cannot be empty'
    }),
  
  confirmNewPassword: Joi.string()
    .valid(Joi.ref('newPassword'))
    .required()
    .messages({
      'any.only': 'New passwords do not match',
      'any.required': 'New password confirmation is required',
      'string.empty': 'New password confirmation cannot be empty'
    })
});

// Update profile validation schema
const updateProfileSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(50)
    .messages({
      'string.min': 'Name must be at least 2 characters long',
      'string.max': 'Name cannot exceed 50 characters',
      'string.empty': 'Name cannot be empty'
    }),
  
  avatar: Joi.string()
    .uri()
    .messages({
      'string.uri': 'Avatar must be a valid URL'
    }),
  
  preferences: Joi.object({
    difficulty: Joi.string()
      .valid('beginner', 'intermediate', 'advanced'),
    topics: Joi.array().items(Joi.string().trim()),
    notifications: Joi.object({
      email: Joi.boolean(),
      push: Joi.boolean(),
      reminders: Joi.boolean()
    }),
    language: Joi.string(),
    timezone: Joi.string()
  })
});

// Email verification validation schema
const emailVerificationSchema = Joi.object({
  token: Joi.string()
    .required()
    .messages({
      'any.required': 'Verification token is required',
      'string.empty': 'Verification token cannot be empty'
    })
});

// Refresh token validation schema
const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string()
    .required()
    .messages({
      'any.required': 'Refresh token is required',
      'string.empty': 'Refresh token cannot be empty'
    })
});

// Logout validation schema
const logoutSchema = Joi.object({
  refreshToken: Joi.string()
    .optional()
    .messages({
      'string.empty': 'Refresh token cannot be empty'
    })
});

// Validation middleware function
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      return res.status(400).json({
        error: 'Validation failed',
        message: errorMessage,
        details: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message,
          value: detail.context?.value
        }))
      });
    }

    // Replace req.body with validated data
    req.body = value;
    next();
  };
};

module.exports = {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  updateProfileSchema,
  emailVerificationSchema,
  refreshTokenSchema,
  logoutSchema,
  validate
}; 