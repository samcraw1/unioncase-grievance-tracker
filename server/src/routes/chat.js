import express from 'express';
import { sendMessage } from '../controllers/chatController.js';
import { authenticate } from '../middleware/auth.js';
import { requireActiveSubscription } from '../middleware/subscription.js';
import pool from '../config/database.js';

const router = express.Router();

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
