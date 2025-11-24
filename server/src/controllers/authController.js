import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import pool from '../config/database.js';
import { getUnionFromCraft } from '../utils/unionConfig.js';

export const register = async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: {
          message: errors.array()[0].msg,
          details: errors.array()
        }
      });
    }

    const {
      email,
      password,
      firstName,
      lastName,
      employeeId,
      role,
      facility,
      craft,
      phone
    } = req.body;

    // Handle empty employee_id as NULL to avoid unique constraint issues
    const employeeIdValue = employeeId && employeeId.trim() !== '' ? employeeId : null;

    // Check if user already exists
    const userExists = await pool.query(
      'SELECT id FROM users WHERE email = $1 OR (employee_id = $2 AND $2 IS NOT NULL)',
      [email, employeeIdValue]
    );

    if (userExists.rows.length > 0) {
      return res.status(400).json({
        error: { message: 'User with this email or employee ID already exists' }
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Auto-determine union_type from craft
    const unionType = getUnionFromCraft(craft);

    // Insert new user
    const result = await pool.query(
      `INSERT INTO users
        (email, password_hash, first_name, last_name, employee_id, role, facility, craft, union_type, phone)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id, email, first_name, last_name, employee_id, role, facility, craft, union_type, phone, created_at`,
      [email, passwordHash, firstName, lastName, employeeIdValue, role, facility, craft, unionType, phone]
    );

    const user = result.rows[0];

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        employeeId: user.employee_id,
        role: user.role,
        facility: user.facility,
        craft: user.craft,
        unionType: user.union_type,
        phone: user.phone
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: { message: 'Failed to register user' } });
  }
};

export const login = async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: {
          message: errors.array()[0].msg,
          details: errors.array()
        }
      });
    }

    const { email, password } = req.body;

    // Find user by email
    const result = await pool.query(
      `SELECT id, email, password_hash, first_name, last_name, employee_id,
              role, facility, craft, union_type, phone
       FROM users WHERE email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        error: { message: 'Invalid email or password' }
      });
    }

    const user = result.rows[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({
        error: { message: 'Invalid email or password' }
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        employeeId: user.employee_id,
        role: user.role,
        facility: user.facility,
        craft: user.craft,
        unionType: user.union_type,
        phone: user.phone
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: { message: 'Failed to login' } });
  }
};

export const getProfile = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, email, first_name, last_name, employee_id,
              role, facility, craft, union_type, phone, created_at
       FROM users WHERE id = $1`,
      [req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: { message: 'User not found' } });
    }

    const user = result.rows[0];

    res.json({
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      employeeId: user.employee_id,
      role: user.role,
      facility: user.facility,
      craft: user.craft,
      unionType: user.union_type,
      phone: user.phone,
      createdAt: user.created_at
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: { message: 'Failed to fetch profile' } });
  }
};
