import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/db.js';
import { isValidLoginId, isValidPassword, isValidEmail } from '../utils/validators.js';

export async function signup(req, res, next) {
  try {
    const { loginId, email, password, confirmPassword } = req.body;

    if (!isValidLoginId(loginId)) {
      return res.status(400).json({ message: 'Login ID must be unique and 6-12 characters' });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }
    if (!isValidPassword(password)) {
      return res.status(400).json({
        message: 'Password must be >8 chars with uppercase, lowercase, and a special character',
      });
    }

    const existing = await prisma.user.findFirst({
      where: { OR: [{ loginId }, { email }] },
    });
    if (existing) {
      return res.status(409).json({ message: 'Login ID or Email already exists' });
    }

    const hashed = await bcrypt.hash(password, 10);

    // Signup always creates an Accountant (Invoicing User) per spec
    const user = await prisma.user.create({
      data: { loginId, email, password: hashed, role: 'ACCOUNTANT' },
    });

    return res.status(201).json({ id: user.id, loginId: user.loginId, role: user.role });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { loginId, password } = req.body;

    const user = await prisma.user.findUnique({ where: { loginId } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid Login Id or Password' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, contactId: user.contactId, loginId: user.loginId },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    return res.json({ token, user: { id: user.id, loginId: user.loginId, role: user.role } });
  } catch (err) {
    next(err);
  }
}
