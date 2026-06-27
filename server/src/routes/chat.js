import express from 'express';
import { sendMessage, sendPublicMessage } from '../controllers/chatController.js';
import { authenticate } from '../middleware/auth.js';
import { requireActiveSubscription } from '../middleware/subscription.js';
import pool from '../config/database.js';

const router = express.Router();

// IP-based rate limiter for the unauthenticated landing-page chat.
// Stricter cap than the authed limiter since anyone on the internet can hit this.
const publicChatRateLimiter = async (req, res, next) => {
  try {
    const ip = req.ip || 'unknown';
    const windowMinutes = 15;
    const maxRequests = 5;

    const result = await pool.query(
      `INSERT INTO chat_public_rate_limits (ip_address, window_start, count)
       VALUES ($1, date_trunc('minute', NOW()) - (EXTRACT(MINUTE FROM NOW())::int % $2) * interval '1 minute', 1)
       ON CONFLICT (ip_address, window_start)
       DO UPDATE SET count = chat_public_rate_limits.count + 1
       RETURNING count`,
      [ip, windowMinutes]
    );

    const count = result.rows[0].count;
    if (count > maxRequests) {
      return res.status(429).json({
        error: { message: 'Too many messages. Please wait a few minutes before sending more.' }
      });
    }

    next();
  } catch (error) {
    console.error('Public rate limiter error:', error);
    next();
  }
};

// Public, unauthenticated route — registered BEFORE the authenticate middleware below.
router.post('/public-message', publicChatRateLimiter, sendPublicMessage);

// DB-backed rate limiter (survives serverless cold starts)
const chatRateLimiter = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const windowMinutes = 15;
    const maxRequests = 20;

    // Insert or increment count for the current 15-minute window
    const result = await pool.query(
      `INSERT INTO chat_rate_limits (user_id, window_start, count)
       VALUES ($1, date_trunc('minute', NOW()) - (EXTRACT(MINUTE FROM NOW())::int % $2) * interval '1 minute', 1)
       ON CONFLICT (user_id, window_start)
       DO UPDATE SET count = chat_rate_limits.count + 1
       RETURNING count`,
      [userId, windowMinutes]
    );

    const count = result.rows[0].count;
    if (count > maxRequests) {
      return res.status(429).json({
        error: { message: 'Too many messages. Please wait a few minutes before sending more.' }
      });
    }

    next();
  } catch (error) {
    console.error('Rate limiter error:', error);
    // On rate limiter failure, allow the request through (fail open for usability)
    next();
  }
};

router.use(authenticate);
router.use(requireActiveSubscription);

router.post('/message', chatRateLimiter, sendMessage);

export default router;
