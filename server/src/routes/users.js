import express from 'express';
import { authenticate } from '../middleware/auth.js';
import pool from '../config/database.js';

const router = express.Router();

router.use(authenticate);

// Get all stewards (for assignment dropdown)
router.get('/stewards', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, first_name, last_name, email, facility
       FROM users
       WHERE role IN ('steward', 'representative')
       ORDER BY last_name, first_name`
    );

    res.json({ stewards: result.rows });
  } catch (error) {
    console.error('Get stewards error:', error);
    res.status(500).json({ error: { message: 'Failed to fetch stewards' } });
  }
});

// Get current user's notification preferences
router.get('/me/preferences', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT notification_preferences
       FROM users
       WHERE id = $1`,
      [req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: { message: 'User not found' } });
    }

    res.json({ preferences: result.rows[0].notification_preferences });
  } catch (error) {
    console.error('Get preferences error:', error);
    res.status(500).json({ error: { message: 'Failed to fetch preferences' } });
  }
});

// Update current user's notification preferences
router.put('/me/preferences', async (req, res) => {
  try {
    const { preferences } = req.body;

    // Validate preferences structure
    const validPreferences = {
      email_enabled: typeof preferences.email_enabled === 'boolean' ? preferences.email_enabled : true,
      new_grievance: typeof preferences.new_grievance === 'boolean' ? preferences.new_grievance : true,
      deadline_reminders: typeof preferences.deadline_reminders === 'boolean' ? preferences.deadline_reminders : true,
      status_updates: typeof preferences.status_updates === 'boolean' ? preferences.status_updates : true,
      new_notes: typeof preferences.new_notes === 'boolean' ? preferences.new_notes : true,
      grievance_resolved: typeof preferences.grievance_resolved === 'boolean' ? preferences.grievance_resolved : true,
      reminder_days: Array.isArray(preferences.reminder_days) ? preferences.reminder_days : [3, 1, 0]
    };

    const result = await pool.query(
      `UPDATE users
       SET notification_preferences = $1
       WHERE id = $2
       RETURNING notification_preferences`,
      [JSON.stringify(validPreferences), req.user.userId]
    );

    res.json({
      message: 'Notification preferences updated successfully',
      preferences: result.rows[0].notification_preferences
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ error: { message: 'Failed to update preferences' } });
  }
});

export default router;
