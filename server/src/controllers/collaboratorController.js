import pool from '../config/database.js';

export const getCollaborators = async (req, res) => {
  try {
    const { grievanceId } = req.params;

    const result = await pool.query(
      `SELECT gc.*, u.first_name, u.last_name, u.email, u.role as user_role,
              a.first_name as added_by_first, a.last_name as added_by_last
       FROM grievance_collaborators gc
       JOIN users u ON gc.user_id = u.id
       LEFT JOIN users a ON gc.added_by = a.id
       WHERE gc.grievance_id = $1
       ORDER BY gc.created_at ASC`,
      [grievanceId]
    );

    res.json({ collaborators: result.rows });
  } catch (error) {
    console.error('Get collaborators error:', error);
    res.status(500).json({ error: { message: 'Failed to fetch collaborators' } });
  }
};

export const addCollaborator = async (req, res) => {
  try {
    const { grievanceId } = req.params;
    const { userId, role = 'viewer' } = req.body;

    if (!userId) {
      return res.status(400).json({ error: { message: 'userId is required' } });
    }

    // Verify the grievance exists and requester has access
    const gCheck = await pool.query(
      'SELECT user_id, steward_assigned FROM grievances WHERE id = $1',
      [grievanceId]
    );
    if (gCheck.rows.length === 0) {
      return res.status(404).json({ error: { message: 'Grievance not found' } });
    }

    const g = gCheck.rows[0];
    // Only the owner, assigned steward, or representatives can add collaborators
    if (req.user.role === 'employee' && g.user_id !== req.user.userId) {
      return res.status(403).json({ error: { message: 'Only the case owner or a steward/rep can add collaborators' } });
    }

    // Verify the user being added exists and is a steward or representative
    const userCheck = await pool.query(
      "SELECT id, role FROM users WHERE id = $1 AND role IN ('steward', 'representative')",
      [userId]
    );
    if (userCheck.rows.length === 0) {
      return res.status(400).json({ error: { message: 'User not found or is not a steward/representative' } });
    }

    const result = await pool.query(
      `INSERT INTO grievance_collaborators (grievance_id, user_id, role, added_by)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (grievance_id, user_id) DO UPDATE SET role = $3
       RETURNING *`,
      [grievanceId, userId, role, req.user.userId]
    );

    res.status(201).json({ collaborator: result.rows[0] });
  } catch (error) {
    console.error('Add collaborator error:', error);
    res.status(500).json({ error: { message: 'Failed to add collaborator' } });
  }
};

export const removeCollaborator = async (req, res) => {
  try {
    const { grievanceId, userId } = req.params;

    const result = await pool.query(
      'DELETE FROM grievance_collaborators WHERE grievance_id = $1 AND user_id = $2 RETURNING *',
      [grievanceId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: { message: 'Collaborator not found' } });
    }

    res.json({ message: 'Collaborator removed' });
  } catch (error) {
    console.error('Remove collaborator error:', error);
    res.status(500).json({ error: { message: 'Failed to remove collaborator' } });
  }
};
