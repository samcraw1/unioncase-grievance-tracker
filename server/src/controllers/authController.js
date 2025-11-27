import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import pool from '../config/database.js';
import { getUnionFromCraft } from '../utils/unionConfig.js';

/**
 * Register a new user
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body containing user data
 * @param {string} req.body.email - User's email address
 * @param {string} req.body.password - User's password (will be hashed)
 * @param {string} req.body.firstName - User's first name
 * @param {string} req.body.lastName - User's last name
 * @param {string} req.body.employeeId - Optional employee ID
 * @param {string} req.body.role - User role (employee, steward, representative)
 * @param {string} req.body.facility - User's work facility
 * @param {string} req.body.craft - User's craft/job classification
 * @param {string} req.body.phone - Optional phone number
 * @param {Object} res - Express response object
 * @returns {Promise<void>} Returns JSON with token and user data
 */
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

    // Check if this facility should be enrolled in trial
    const shouldEnrollInTrial = (facility) => {
      const trialFacilities = process.env.TRIAL_ENABLED_FACILITIES || '*';

      // If wildcard, all new users get trial
      if (trialFacilities === '*') return true;

      // If empty, no trials
      if (!trialFacilities || trialFacilities.trim() === '') return false;

      // Check if facility is in enabled list (case-insensitive)
      const enabledList = trialFacilities.split(',').map(f => f.trim().toLowerCase());
      return enabledList.includes((facility || '').toLowerCase());
    };

    // Calculate trial dates or set to active
    let trialStartsAt = null;
    let trialEndsAt = null;
    let subscriptionStatus = 'active';

    if (shouldEnrollInTrial(facility)) {
      // Enroll in trial
      const now = new Date();
      trialStartsAt = now;
      trialEndsAt = new Date(now);
      trialEndsAt.setDate(trialEndsAt.getDate() + 30); // 30 days from now
      subscriptionStatus = 'trial';
    }

    // Insert new user with trial information
    const result = await pool.query(
      `INSERT INTO users
        (email, password_hash, first_name, last_name, employee_id, role, facility, craft, union_type, phone,
         trial_starts_at, trial_ends_at, subscription_status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING id, email, first_name, last_name, employee_id, role, facility, craft, union_type, phone, created_at,
                 trial_starts_at, trial_ends_at, subscription_status`,
      [email, passwordHash, firstName, lastName, employeeIdValue, role, facility, craft, unionType, phone,
       trialStartsAt, trialEndsAt, subscriptionStatus]
    );

    const user = result.rows[0];

    // Send welcome email if user is on trial
    if (user.subscription_status === 'trial') {
      try {
        // Dynamic import to avoid circular dependency
        const { sendTrialWelcomeEmail } = await import('../services/emailService.js');
        await sendTrialWelcomeEmail(user);
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError);
        // Don't fail registration if email fails
      }
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
        phone: user.phone,
        subscriptionStatus: user.subscription_status,
        trialStartsAt: user.trial_starts_at,
        trialEndsAt: user.trial_ends_at
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: { message: 'Failed to register user' } });
  }
};

/**
 * Authenticate user and return JWT token
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body containing login credentials
 * @param {string} req.body.email - User's email address
 * @param {string} req.body.password - User's password
 * @param {Object} res - Express response object
 * @returns {Promise<void>} Returns JSON with token and user data
 */
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

    // Find user by email - Include subscription fields
    const result = await pool.query(
      `SELECT id, email, password_hash, first_name, last_name, employee_id,
              role, facility, craft, union_type, phone,
              subscription_status, trial_starts_at, trial_ends_at
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

    // Check if trial has expired and update status
    if (user.subscription_status === 'trial' && user.trial_ends_at) {
      const now = new Date();
      const trialEnd = new Date(user.trial_ends_at);

      if (now > trialEnd) {
        // Update user status to expired
        await pool.query(
          'UPDATE users SET subscription_status = $1 WHERE id = $2',
          ['expired', user.id]
        );
        user.subscription_status = 'expired';
      }
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
        phone: user.phone,
        subscriptionStatus: user.subscription_status,
        trialStartsAt: user.trial_starts_at,
        trialEndsAt: user.trial_ends_at
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: { message: 'Failed to login' } });
  }
};

/**
 * Get authenticated user's profile
 * @param {Object} req - Express request object
 * @param {Object} req.user - User object from authentication middleware
 * @param {number} req.user.userId - Authenticated user's ID
 * @param {Object} res - Express response object
 * @returns {Promise<void>} Returns JSON with user profile data
 */
export const getProfile = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, email, first_name, last_name, employee_id,
              role, facility, craft, union_type, phone, created_at,
              subscription_status, trial_starts_at, trial_ends_at
       FROM users WHERE id = $1`,
      [req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: { message: 'User not found' } });
    }

    const user = result.rows[0];

    // Check and update trial expiration
    if (user.subscription_status === 'trial' && user.trial_ends_at) {
      const now = new Date();
      const trialEnd = new Date(user.trial_ends_at);

      if (now > trialEnd) {
        await pool.query(
          'UPDATE users SET subscription_status = $1 WHERE id = $2',
          ['expired', user.id]
        );
        user.subscription_status = 'expired';
      }
    }

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
      createdAt: user.created_at,
      subscriptionStatus: user.subscription_status,
      trialStartsAt: user.trial_starts_at,
      trialEndsAt: user.trial_ends_at
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: { message: 'Failed to fetch profile' } });
  }
};
