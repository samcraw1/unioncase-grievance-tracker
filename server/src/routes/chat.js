import express from 'express';
import {
  sendMessage,
  sendCaseMessage,
  suggestArticles,
  getAlerts,
  generateDraft,
} from '../controllers/chatController.js';
import { authenticate } from '../middleware/auth.js';
import { requireActiveSubscription } from '../middleware/subscription.js';
import pool from '../config/database.js';

const router = express.Router();

/**
 * DB-backed rate limiter factory (survives serverless cold starts).
 * @param {number} windowMinutes - Rolling window size in minutes
 * @param {number} maxRequests - Max requests per window
 */
function createRateLimiter(windowMinutes, maxRequests) {
  return async (req, res, next) => {
    try {
      const userId = req.user.userId;

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
      // Fail open for usability
      next();
    }
  };
}

router.use(authenticate);
router.use(requireActiveSubscription);

// Phase 1: General chat
router.post('/message', createRateLimiter(15, 20), sendMessage);

// Phase 3: Case-specific chat
router.post('/case-message', createRateLimiter(15, 20), sendCaseMessage);

// Phase 3: Article suggestions
router.get('/suggest-articles/:grievanceId', createRateLimiter(15, 10), suggestArticles);

// Phase 3: Proactive alerts
router.get('/alerts', createRateLimiter(15, 30), getAlerts);

// Phase 2: Draft generation
router.post('/draft', createRateLimiter(15, 10), generateDraft);

export default router;
