/**
 * Validation utilities for form inputs
 */

/**
 * Validate email format
 * @param {string} email - Email address to validate
 * @returns {boolean} True if valid email format
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} Validation result with isValid and message
 */
export const validatePassword = (password) => {
  if (!password || password.length < 6) {
    return {
      isValid: false,
      message: 'Password must be at least 6 characters long'
    };
  }

  return { isValid: true, message: '' };
};

/**
 * Validate required field
 * @param {any} value - Value to check
 * @param {string} fieldName - Name of the field for error message
 * @returns {Object} Validation result
 */
export const validateRequired = (value, fieldName = 'This field') => {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return {
      isValid: false,
      message: `${fieldName} is required`
    };
  }

  return { isValid: true, message: '' };
};

/**
 * Validate phone number (basic US format)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid format
 */
export const isValidPhone = (phone) => {
  if (!phone) return true; // Phone is optional

  const phoneRegex = /^[\d\s\-\(\)]+$/;
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');

  return phoneRegex.test(phone) && cleaned.length >= 10;
};

/**
 * Validate date is not in the future
 * @param {string} dateString - Date string to validate
 * @returns {Object} Validation result
 */
export const validatePastDate = (dateString) => {
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(23, 59, 59, 999);

  if (date > today) {
    return {
      isValid: false,
      message: 'Date cannot be in the future'
    };
  }

  return { isValid: true, message: '' };
};

/**
 * Validate file size
 * @param {File} file - File to validate
 * @param {number} maxSizeMB - Maximum size in megabytes
 * @returns {Object} Validation result
 */
export const validateFileSize = (file, maxSizeMB = 10) => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  if (file.size > maxSizeBytes) {
    return {
      isValid: false,
      message: `File size must be less than ${maxSizeMB}MB`
    };
  }

  return { isValid: true, message: '' };
};

/**
 * Validate file type
 * @param {File} file - File to validate
 * @param {string[]} allowedTypes - Array of allowed MIME types or extensions
 * @returns {Object} Validation result
 */
export const validateFileType = (file, allowedTypes = ['image/jpeg', 'image/png', 'application/pdf']) => {
  const fileType = file.type;
  const fileName = file.name.toLowerCase();

  const isAllowed = allowedTypes.some(type => {
    if (type.includes('/')) {
      return fileType === type;
    } else {
      return fileName.endsWith(type);
    }
  });

  if (!isAllowed) {
    return {
      isValid: false,
      message: 'File type not allowed. Please upload a valid file.'
    };
  }

  return { isValid: true, message: '' };
};

/**
 * Comprehensive form validation
 * @param {Object} formData - Form data to validate
 * @param {Object} validationRules - Validation rules for each field
 * @returns {Object} Object with errors for each field
 */
export const validateForm = (formData, validationRules) => {
  const errors = {};

  Object.keys(validationRules).forEach(field => {
    const rules = validationRules[field];
    const value = formData[field];

    for (const rule of rules) {
      const result = rule(value);
      if (!result.isValid) {
        errors[field] = result.message;
        break; // Stop at first error for this field
      }
    }
  });

  return errors;
};
