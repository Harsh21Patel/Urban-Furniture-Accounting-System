import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/db.js';
import { isValidLoginId, isValidPassword, isValidEmail } from '../utils/validators.js';

export async function signup(req, res, next) {
  try {
    const { loginId, email, password, confirmPassword } = req.body;

    if (!isValidLoginId(loginId)) {
      return res.status(400).json({ message: 'Login ID must be unique and between 6-12 characters' });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }
    if (!isValidPassword(password)) {
      return res.status(400).json({
        message: 'Password must be >8 characters with uppercase, lowercase, and a special character',
      });
    }

    const existingLogin = await prisma.user.findUnique({ where: { loginId } });
    if (existingLogin) {
      return res.status(409).json({ message: 'Login ID already exists' });
    }

    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) {
      return res.status(409).json({ message: 'Email address already exists in database' });
    }

    const hashed = await bcrypt.hash(password, 10);

    // Signup creates an Accountant (Invoicing User) per spec
    const user = await prisma.user.create({
      data: {
        name: loginId,
        loginId,
        email,
        password: hashed,
        role: 'ACCOUNTANT',
      },
    });

    return res.status(201).json({ id: user.id, loginId: user.loginId, email: user.email, role: user.role });
  } catch (err) {
    next(err);
  }
}

export async function createUser(req, res, next) {
  try {
    const { name, loginId, email, role, password, confirmPassword, contactId } = req.body;

    if (!isValidLoginId(loginId)) {
      return res.status(400).json({ message: 'Login ID must be unique and between 6-12 characters' });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }
    if (!isValidPassword(password)) {
      return res.status(400).json({
        message: 'Password must be >8 characters with uppercase, lowercase, and a special character',
      });
    }

    const existingLogin = await prisma.user.findUnique({ where: { loginId } });
    if (existingLogin) {
      return res.status(409).json({ message: 'Login ID already exists' });
    }

    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) {
      return res.status(409).json({ message: 'Email address already exists in database' });
    }

    const hashed = await bcrypt.hash(password, 10);

    let parsedContactId = contactId ? Number(contactId) : null;
    
    // If role is CONTACT_USER (User), ensure single portal user per contact
    if (role === 'CONTACT_USER') {
      if (!parsedContactId) {
        const existingContact = await prisma.contact.findUnique({ where: { email } });
        if (existingContact) {
          parsedContactId = existingContact.id;
        } else {
          const newContact = await prisma.contact.create({
            data: {
              name: name || loginId,
              type: 'CUSTOMER',
              email,
            },
          });
          parsedContactId = newContact.id;
        }
      }

      const existingPortalUser = await prisma.user.findFirst({
        where: { contactId: parsedContactId, role: 'CONTACT_USER' },
      });
      if (existingPortalUser) {
        return res.status(409).json({ message: 'A Portal User (CONTACT_USER) already exists for this contact' });
      }
    }

    const user = await prisma.user.create({
      data: {
        name: name || loginId,
        loginId,
        email,
        password: hashed,
        role: role || 'ACCOUNTANT',
        contactId: parsedContactId,
      },
    });

    return res.status(201).json({ id: user.id, name: user.name, loginId: user.loginId, email: user.email, role: user.role });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { loginId, password } = req.body;
    console.log("Login:", loginId, password);

    const user = await prisma.user.findUnique({
      where: { loginId },
      include: { contact: true },
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid Login Id or Password' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, contactId: user.contactId, loginId: user.loginId, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name || user.loginId,
        loginId: user.loginId,
        email: user.email,
        role: user.role,
        contactId: user.contactId,
        contact: user.contact,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getMe(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { contact: true },
    });
    if (!user) return res.status(404).json({ message: 'User not found' });
    const { password, ...safeUser } = user;
    res.json(safeUser);
  } catch (err) {
    next(err);
  }
}

export async function listUsers(req, res, next) {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        loginId: true,
        email: true,
        role: true,
        contactId: true,
        contact: { select: { id: true, name: true, email: true } },
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(users);
  } catch (err) {
    next(err);
  }
}
