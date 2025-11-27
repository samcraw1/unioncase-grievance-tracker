import pool from '../config/database.js';

/**
 * Middleware to check if user has active subscription
 * Blocks expired users from accessing protected endpoints
 */
export const requireActiveSubscription = async (req, res, next) => {
  try {
    // Get user's current subscription status from database
    const result = await pool.query(
      `SELECT subscription_status, trial_ends_at
       FROM users
       WHERE id = $1`,
      [req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: {
          message: 'User not found',
          code: 'USER_NOT_FOUND'
        }
      });
    }

    const { subscription_status, trial_ends_at } = result.rows[0];

    // Check if trial has expired and update if needed
    if (subscription_status === 'trial' && trial_ends_at) {
      const now = new Date();
      const trialEnd = new Date(trial_ends_at);

      if (now > trialEnd) {
        // Update status to expired
        await pool.query(
          'UPDATE users SET subscription_status = $1 WHERE id = $2',
          ['expired', req.user.userId]
        );

        return res.status(403).json({
          error: {
            message: 'Your trial has expired. Please contact us to activate your subscription.',
            code: 'TRIAL_EXPIRED',
            contactEmail: process.env.SUPPORT_EMAIL || 'samcraw01@gmail.com',
            contactPhone: process.env.SUPPORT_PHONE || '501-580-6175'
          }
        });
      }
    }

    // Block if subscription is expired or cancelled
    if (subscription_status === 'expired' || subscription_status === 'cancelled') {
      return res.status(403).json({
        error: {
          message: 'Your subscription is not active. Please contact us to reactivate.',
          code: 'SUBSCRIPTION_INACTIVE',
          status: subscription_status,
          contactEmail: process.env.SUPPORT_EMAIL || 'samcraw01@gmail.com',
          contactPhone: process.env.SUPPORT_PHONE || '501-580-6175'
        }
      });
    }

    // User has active subscription or valid trial - allow access
    next();
  } catch (error) {
    console.error('Subscription check error:', error);
    res.status(500).json({
      error: {
        message: 'Failed to verify subscription status'
      }
    });
  }
};
