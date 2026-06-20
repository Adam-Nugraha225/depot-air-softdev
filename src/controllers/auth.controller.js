const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const prisma = require('../utils/db');
const { successResponse, errorResponse } = require('../utils/response');

const registerSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('BUYER', 'VENDOR').default('BUYER'),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

exports.register = async (req, res, next) => {
  try {
    const { error, value } = registerSchema.validate(req.body);
    if (error) return next(error);

    const { name, email, password, role } = value;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return errorResponse(res, 'Email already in use', 400);

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        ...(role === 'VENDOR' ? {
          vendorProfile: {
            create: {
              verificationStatus: 'PENDING',
              profileCompletion: 0,
              specialty: null,
              mainLocation: null,
              pricePerLiter: 0,
              defaultCapacity: 0,
            }
          }
        } : {}),
      },
      select: { id: true, name: true, email: true, role: true }
    });

    return successResponse(res, user, 'User registered successfully', 201);
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    if (error) return next(error);

    const { email, password } = value;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return errorResponse(res, 'Invalid credentials', 401);

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return errorResponse(res, 'Invalid credentials', 401);

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return successResponse(res, {
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    }, 'Login successful');
  } catch (err) {
    next(err);
  }
};

exports.googleLogin = async (req, res, next) => {
  // Mockup for Google Login. In a real app, verify the Google token here.
  try {
    const { email, name } = req.body; // In reality, get these from verified Google Token
    if (!email || !name) return errorResponse(res, 'Email and Name are required for Google Login mock', 400);

    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Create user if not exists
      const randomPassword = await bcrypt.hash(Math.random().toString(36), 10);
      user = await prisma.user.create({
        data: { name, email, password: randomPassword, role: 'BUYER' }
      });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return successResponse(res, {
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    }, 'Google login successful');
  } catch (err) {
    next(err);
  }
};
