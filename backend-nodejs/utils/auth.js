import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export const hashPassword = (password) => {
  return bcrypt.hashSync(password, 10);
};

export const comparePassword = (password, hash) => {
  return bcrypt.compareSync(password, hash);
};

export const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password) => {
  return password && password.length >= 6;
};