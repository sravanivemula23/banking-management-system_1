// These rules mirror the Bean Validation annotations on the Spring Boot DTOs.

export const validateEmail = (v) => {
  if (!v?.trim()) return 'Email is required';
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'Enter a valid email address';
};

export const validateName = (v) => {
  if (!v?.trim()) return 'Name is required';
  return v.trim().length > 100 ? 'Name must be at most 100 characters' : '';
};

export const validatePassword = (v) => {
  if (!v) return 'Password is required';
  if (v.length < 8 || v.length > 72) return 'Password must be 8-72 characters';
  if (!/[A-Za-z]/.test(v) || !/\d/.test(v)) return 'Password must contain letters and digits';
  return '';
};

/** Amount must be > 0 with at most 2 decimal places (the backend rejects anything else). */
export const validateAmount = (v, { max } = {}) => {
  if (v === '' || v == null) return 'Amount is required';
  if (!/^\d+(\.\d{1,2})?$/.test(String(v).trim())) return 'Enter a valid amount (max 2 decimal places)';
  const n = Number(v);
  if (n < 0.01) return 'Amount must be at least 0.01';
  if (max != null && n > max) return 'Amount exceeds the available balance';
  return '';
};

export const hasErrors = (errors) => Object.values(errors).some(Boolean);
