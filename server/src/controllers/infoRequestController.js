import pool from '../config/database.js';

export const createInfoRequest = async (req, res) => {
  try {
    const { grievanceId } = req.params;
    const { description, itemsRequested, dueDate } = req.body;

    if (!description || !itemsRequested?.length) {
      return res.status(400).json({ error: { message: 'Description and items are required' } });
    }

    // Verify access to the grievance
    const gCheck = await pool.query(
      'SELECT user_id, steward_assigned FROM grievances WHERE id = $1',
      [grievanceId]
    );
    if (gCheck.rows.length === 0) {
      return res.status(404).json({ error: { message: 'Grievance not found' } });
    }
    const g = gCheck.rows[0];
    if (req.user.role === 'employee' && g.user_id !== req.user.userId && g.steward_assigned !== req.user.userId) {
      return res.status(403).json({ error: { message: 'Access denied' } });
    }

    const result = await pool.query(
      `INSERT INTO information_requests (grievance_id, requested_by, description, items_requested, due_date)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [grievanceId, req.user.userId, description, itemsRequested, dueDate || null]
    );

    res.status(201).json({ infoRequest: result.rows[0] });
  } catch (error) {
    console.error('Create info request error:', error);
    res.status(500).json({ error: { message: 'Failed to create information request' } });
  }
};

export const getInfoRequests = async (req, res) => {
  try {
    const { grievanceId } = req.params;

    const result = await pool.query(
      `SELECT ir.*, u.first_name || ' ' || u.last_name as requested_by_name
       FROM information_requests ir
       LEFT JOIN users u ON ir.requested_by = u.id
       WHERE ir.grievance_id = $1
       ORDER BY ir.created_at DESC`,
      [grievanceId]
    );

    res.json({ infoRequests: result.rows });
  } catch (error) {
    console.error('Get info requests error:', error);
    res.status(500).json({ error: { message: 'Failed to fetch information requests' } });
  }
};

export const updateInfoRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, responseNotes, responseDate } = req.body;

    const validStatuses = ['sent', 'received', 'partial', 'refused', 'overdue'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ error: { message: 'Invalid status' } });
    }

    const setClauses = [];
    const params = [];
    let paramIndex = 1;

    if (status) {
      setClauses.push(`status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }
    if (responseNotes !== undefined) {
      setClauses.push(`response_notes = $${paramIndex}`);
      params.push(responseNotes);
      paramIndex++;
    }
    if (responseDate) {
      setClauses.push(`response_date = $${paramIndex}`);
      params.push(responseDate);
      paramIndex++;
    }
    setClauses.push('updated_at = CURRENT_TIMESTAMP');

    params.push(id);

    const result = await pool.query(
      `UPDATE information_requests SET ${setClauses.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      params
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: { message: 'Information request not found' } });
    }

    res.json({ infoRequest: result.rows[0] });
  } catch (error) {
    console.error('Update info request error:', error);
    res.status(500).json({ error: { message: 'Failed to update information request' } });
  }
};
