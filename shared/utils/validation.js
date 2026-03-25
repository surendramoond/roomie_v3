import { USER_ROLES } from '../constants/roles';

// landlords type all kinds of phone formats, so we clean it first
export const sanitizePhone = (value = '') => value.replace(/\D/g, '');

export const isValidStudentEmail = (value = '') =>
  value.trim().toLowerCase().endsWith('@unbc.ca');

export const isValidLandlordPhone = (value = '') => sanitizePhone(value).length === 10;

export const validateIdentifierForRole = ({ role, identifier }) => {
  if (!identifier?.trim()) {
    return { valid: false, error: 'Please enter your email or phone number.' };
  }

  if (role === USER_ROLES.STUDENT && !isValidStudentEmail(identifier)) {
    return { valid: false, error: 'Students must use @unbc.ca email.' };
  }

  if (role === USER_ROLES.LANDLORD && !isValidLandlordPhone(identifier)) {
    return { valid: false, error: 'Enter a valid 10-digit phone number.' };
  }

  return { valid: true };
};

export const validateSignupFields = ({ displayName, role, identifier, password, confirmPassword }) => {
  if (!displayName?.trim()) {
    return { valid: false, error: 'Please enter your name.' };
  }

  // reuse identifier rules here so login and signup never drift apart
  const identifierValidation = validateIdentifierForRole({ role, identifier });
  if (!identifierValidation.valid) {
    return identifierValidation;
  }

  if (!password?.trim()) {
    return { valid: false, error: 'Please enter a password.' };
  }

  if (password.length < 6) {
    return { valid: false, error: 'Password must be at least 6 characters.' };
  }

  if (password !== confirmPassword) {
    return { valid: false, error: 'Passwords do not match.' };
  }

  return { valid: true };
};

export const validateListingForm = (payload) => {
  return { valid: true };
};
