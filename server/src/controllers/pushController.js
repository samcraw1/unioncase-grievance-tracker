import pool from '../config/database.js';

/**
 * Save a push subscription for the authenticated user.
 * Called when the browser grants push notification permission.
 */
export const subscribe = async (req, res) => {
  try {
    const { endpoint, keys } = req.body;

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return res.status(400).json({ error: { message: 'Invalid push subscription data' } });
    }

    await pool.query(
      `INSERT INTO push_subscriptions (user_id, endpoint, p256dh, auth)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, endpoint) DO UPDATE SET p256dh = $3, auth = $4`,
      [req.user.userId, endpoint, keys.p256dh, keys.auth]
    );

    res.json({ message: 'Push subscription saved' });
  } catch (error) {
    console.error('Push subscribe error:', error);
    res.status(500).json({ error: { message: 'Failed to save push subscription' } });
  }
};

/**
 * Remove a push subscription (when user revokes permission).
 */
export const unsubscribe = async (req, res) => {
  try {
    const { endpoint } = req.body;

    if (!endpoint) {
      return res.status(400).json({ error: { message: 'Endpoint is required' } });
    }

    await pool.query(
      'DELETE FROM push_subscriptions WHERE user_id = $1 AND endpoint = $2',
      [req.user.userId, endpoint]
    );

    res.json({ message: 'Push subscription removed' });
  } catch (error) {
    console.error('Push unsubscribe error:', error);
    res.status(500).json({ error: { message: 'Failed to remove push subscription' } });
  }
};
