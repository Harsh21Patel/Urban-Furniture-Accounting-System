// Login ID: unique (checked in DB) and 6-12 chars
export const isValidLoginId = (id) => typeof id === 'string' && id.length >= 6 && id.length <= 12;

// Password: >8 chars, at least one lowercase, one uppercase, one special char
export const isValidPassword = (pwd) =>
  typeof pwd === 'string' &&
  pwd.length > 8 &&
  /[a-z]/.test(pwd) &&
  /[A-Z]/.test(pwd) &&
  /[^A-Za-z0-9]/.test(pwd);

export const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
