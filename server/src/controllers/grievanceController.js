import pool from '../config/database.js';

/**
 * Generate unique grievance number in format GRVNC-YYYY-####
 * @returns {Promise<string>} Generated grievance number
 */
const generateGrievanceNumber = async () => {
  const year = new Date().getFullYear();
  const result = await pool.query(
    `SELECT COUNT(*) as count FROM grievances WHERE grievance_number LIKE $1`,
    [`GRVNC-${year}-%`]
  );
  const count = parseInt(result.rows[0].count) + 1;
  return `GRVNC-${year}-${String(count).padStart(4, '0')}`;
};

/**
 * Create a new grievance
 * @param {Object} req - Express request object
 * @param {Object} req.body - Grievance data
 * @param {Object} req.user - Authenticated user from middleware
 * @param {Object} res - Express response object
 * @returns {Promise<void>} Returns JSON with created grievance data
 */
export const createGrievance = async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const {
      grievantName,
      grievantEmployeeId,
      facility,
      craft,
      incidentDate,
      incidentTime,
      contractArticle,
      violationType,
      briefDescription,
      detailedDescription,
      managementRepresentative,
      witnesses,
      stewardAssigned
    } = req.body;

    // Generate grievance number
    const grievanceNumber = await generateGrievanceNumber();

    // Insert grievance
    const grievanceResult = await client.query(
      `INSERT INTO grievances
        (grievance_number, user_id, grievant_name, grievant_employee_id, facility, craft,
         incident_date, incident_time, contract_article, violation_type,
         brief_description, detailed_description, management_representative,
         witnesses, steward_assigned, current_step, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
       RETURNING *`,
      [
        grievanceNumber,
        req.user.userId,
        grievantName,
        grievantEmployeeId,
        facility,
        craft,
        incidentDate,
        incidentTime || null,
        contractArticle,
        violationType,
        briefDescription,
        detailedDescription,
        managementRepresentative || null,
        witnesses || [],
        stewardAssigned || null,
        'filed',
        'active'
      ]
    );

    const grievance = grievanceResult.rows[0];

    // Add initial timeline entry
    await client.query(
      `INSERT INTO grievance_timeline (grievance_id, step, step_date, handler_id, notes)
       VALUES ($1, $2, $3, $4, $5)`,
      [grievance.id, 'filed', new Date(), req.user.userId, 'Grievance filed']
    );

    // Calculate and add initial deadlines
    const filedDate = new Date(incidentDate);
    const informalDeadline = new Date(filedDate);
    informalDeadline.setDate(informalDeadline.getDate() + 14); // 14 days for informal step

    await client.query(
      `INSERT INTO deadlines (grievance_id, deadline_type, deadline_date, description)
       VALUES ($1, $2, $3, $4)`,
      [grievance.id, 'informal_step_a', informalDeadline, 'Informal Step A must be scheduled']
    );

    await client.query('COMMIT');

    res.status(201).json({
      message: 'Grievance created successfully',
      grievance: {
        id: grievance.id,
        grievanceNumber: grievance.grievance_number,
        currentStep: grievance.current_step,
        status: grievance.status,
        createdAt: grievance.created_at
      }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create grievance error:', error);
    res.status(500).json({ error: { message: 'Failed to create grievance' } });
  } finally {
    client.release();
  }
};

/**
 * Get list of grievances with filtering and pagination
 * Access control applied based on user role
 * @param {Object} req - Express request object
 * @param {Object} req.query - Query parameters for filtering
 * @param {Object} req.user - Authenticated user
 * @param {Object} res - Express response object
 * @returns {Promise<void>} Returns JSON with grievances array and pagination info
 */
export const getGrievances = async (req, res) => {
  try {
    const { status, currentStep, facility, limit = 50, offset = 0 } = req.query;

    let query = `
      SELECT g.*,
        u.first_name || ' ' || u.last_name as filed_by_name,
        s.first_name || ' ' || s.last_name as steward_name,
        (SELECT COUNT(*) FROM documents WHERE grievance_id = g.id) as document_count
      FROM grievances g
      LEFT JOIN users u ON g.user_id = u.id
      LEFT JOIN users s ON g.steward_assigned = s.id
      WHERE 1=1
    `;

    const params = [];
    let paramIndex = 1;

    // Filter by user's access
    if (req.user.role === 'employee') {
      query += ` AND g.user_id = $${paramIndex}`;
      params.push(req.user.userId);
      paramIndex++;
    } else if (req.user.role === 'steward') {
      query += ` AND (g.user_id = $${paramIndex} OR g.steward_assigned = $${paramIndex})`;
      params.push(req.user.userId);
      paramIndex++;
    }

    // Additional filters
    if (status) {
      query += ` AND g.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (currentStep) {
      query += ` AND g.current_step = $${paramIndex}`;
      params.push(currentStep);
      paramIndex++;
    }

    if (facility) {
      query += ` AND g.facility = $${paramIndex}`;
      params.push(facility);
      paramIndex++;
    }

    query += ` ORDER BY g.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM grievances g WHERE 1=1';
    const countParams = [];
    let countIndex = 1;

    if (req.user.role === 'employee') {
      countQuery += ` AND g.user_id = $${countIndex}`;
      countParams.push(req.user.userId);
      countIndex++;
    } else if (req.user.role === 'steward') {
      countQuery += ` AND (g.user_id = $${countIndex} OR g.steward_assigned = $${countIndex})`;
      countParams.push(req.user.userId);
      countIndex++;
    }

    if (status) {
      countQuery += ` AND g.status = $${countIndex}`;
      countParams.push(status);
      countIndex++;
    }

    if (currentStep) {
      countQuery += ` AND g.current_step = $${countIndex}`;
      countParams.push(currentStep);
      countIndex++;
    }

    if (facility) {
      countQuery += ` AND g.facility = $${countIndex}`;
      countParams.push(facility);
    }

    const countResult = await pool.query(countQuery, countParams);

    res.json({
      grievances: result.rows,
      total: parseInt(countResult.rows[0].count),
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Get grievances error:', error);
    res.status(500).json({ error: { message: 'Failed to fetch grievances' } });
  }
};

/**
 * Get detailed information about a specific grievance
 * Includes timeline, deadlines, documents, and notes
 * @param {Object} req - Express request object
 * @param {Object} req.params - URL parameters
 * @param {string} req.params.id - Grievance ID
 * @param {Object} req.user - Authenticated user
 * @param {Object} res - Express response object
 * @returns {Promise<void>} Returns JSON with complete grievance details
 */
export const getGrievanceById = async (req, res) => {
  try {
    const { id } = req.params;

    const grievanceResult = await pool.query(
      `SELECT g.*,
        u.first_name || ' ' || u.last_name as filed_by_name,
        u.email as filed_by_email,
        s.first_name || ' ' || s.last_name as steward_name,
        s.email as steward_email
       FROM grievances g
       LEFT JOIN users u ON g.user_id = u.id
       LEFT JOIN users s ON g.steward_assigned = s.id
       WHERE g.id = $1`,
      [id]
    );

    if (grievanceResult.rows.length === 0) {
      return res.status(404).json({ error: { message: 'Grievance not found' } });
    }

    const grievance = grievanceResult.rows[0];

    // Check access permissions
    if (
      req.user.role === 'employee' &&
      grievance.user_id !== req.user.userId &&
      grievance.steward_assigned !== req.user.userId
    ) {
      return res.status(403).json({ error: { message: 'Access denied' } });
    }

    // Get timeline
    const timelineResult = await pool.query(
      `SELECT t.*, u.first_name || ' ' || u.last_name as handler_name
       FROM grievance_timeline t
       LEFT JOIN users u ON t.handler_id = u.id
       WHERE t.grievance_id = $1
       ORDER BY t.step_date ASC`,
      [id]
    );

    // Get deadlines
    const deadlinesResult = await pool.query(
      `SELECT * FROM deadlines
       WHERE grievance_id = $1
       ORDER BY deadline_date ASC`,
      [id]
    );

    // Get documents
    const documentsResult = await pool.query(
      `SELECT d.*, u.first_name || ' ' || u.last_name as uploaded_by_name
       FROM documents d
       LEFT JOIN users u ON d.uploaded_by = u.id
       WHERE d.grievance_id = $1
       ORDER BY d.created_at DESC`,
      [id]
    );

    // Get notes
    const notesResult = await pool.query(
      `SELECT n.*, u.first_name || ' ' || u.last_name as author_name
       FROM notes n
       LEFT JOIN users u ON n.user_id = u.id
       WHERE n.grievance_id = $1
       ORDER BY n.created_at DESC`,
      [id]
    );

    res.json({
      ...grievance,
      timeline: timelineResult.rows,
      deadlines: deadlinesResult.rows,
      documents: documentsResult.rows,
      notes: notesResult.rows
    });
  } catch (error) {
    console.error('Get grievance by ID error:', error);
    res.status(500).json({ error: { message: 'Failed to fetch grievance' } });
  }
};

/**
 * Update the current step of a grievance
 * Creates a new timeline entry
 * @param {Object} req - Express request object
 * @param {Object} req.params - URL parameters
 * @param {string} req.params.id - Grievance ID
 * @param {Object} req.body - Update data
 * @param {string} req.body.newStep - New step value
 * @param {string} req.body.notes - Optional notes about the update
 * @param {Object} res - Express response object
 * @returns {Promise<void>} Returns JSON with updated grievance
 */
export const updateGrievanceStep = async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const { id } = req.params;
    const { newStep, notes } = req.body;

    // Update grievance step
    const result = await client.query(
      `UPDATE grievances
       SET current_step = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [newStep, id]
    );

    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: { message: 'Grievance not found' } });
    }

    // Add timeline entry
    await client.query(
      `INSERT INTO grievance_timeline (grievance_id, step, step_date, handler_id, notes)
       VALUES ($1, $2, $3, $4, $5)`,
      [id, newStep, new Date(), req.user.userId, notes || `Updated to ${newStep}`]
    );

    await client.query('COMMIT');

    res.json({
      message: 'Grievance step updated successfully',
      grievance: result.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Update grievance step error:', error);
    res.status(500).json({ error: { message: 'Failed to update grievance step' } });
  } finally {
    client.release();
  }
};

/**
 * Add a note to a grievance
 * @param {Object} req - Express request object
 * @param {Object} req.params - URL parameters
 * @param {string} req.params.id - Grievance ID
 * @param {Object} req.body - Note data
 * @param {string} req.body.noteText - The note content
 * @param {boolean} req.body.isInternal - Whether note is internal (stewards only)
 * @param {Object} res - Express response object
 * @returns {Promise<void>} Returns JSON with created note
 */
export const addNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { noteText, isInternal = false } = req.body;

    const result = await pool.query(
      `INSERT INTO notes (grievance_id, user_id, note_text, is_internal)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [id, req.user.userId, noteText, isInternal]
    );

    res.status(201).json({
      message: 'Note added successfully',
      note: result.rows[0]
    });
  } catch (error) {
    console.error('Add note error:', error);
    res.status(500).json({ error: { message: 'Failed to add note' } });
  }
};

/**
 * Get grievance statistics for the authenticated user
 * Returns counts by status, step, and pending deadlines
 * @param {Object} req - Express request object
 * @param {Object} req.user - Authenticated user
 * @param {Object} res - Express response object
 * @returns {Promise<void>} Returns JSON with statistics
 */
export const getStatistics = async (req, res) => {
  try {
    // Get various statistics
    const stats = await pool.query(`
      SELECT
        COUNT(*) FILTER (WHERE status = 'active') as active_count,
        COUNT(*) FILTER (WHERE status = 'resolved') as resolved_count,
        COUNT(*) FILTER (WHERE status = 'settled') as settled_count,
        COUNT(*) as total_count,
        COUNT(*) FILTER (WHERE current_step = 'filed') as filed_count,
        COUNT(*) FILTER (WHERE current_step = 'step_b') as step_b_count
      FROM grievances
      WHERE user_id = $1 OR steward_assigned = $1
    `, [req.user.userId]);

    const pendingDeadlines = await pool.query(`
      SELECT COUNT(*) as count
      FROM deadlines d
      JOIN grievances g ON d.grievance_id = g.id
      WHERE (g.user_id = $1 OR g.steward_assigned = $1)
        AND d.is_completed = false
        AND d.deadline_date >= CURRENT_DATE
    `, [req.user.userId]);

    res.json({
      activeGrievances: parseInt(stats.rows[0].active_count),
      resolvedGrievances: parseInt(stats.rows[0].resolved_count),
      settledGrievances: parseInt(stats.rows[0].settled_count),
      totalGrievances: parseInt(stats.rows[0].total_count),
      filedCount: parseInt(stats.rows[0].filed_count),
      stepBCount: parseInt(stats.rows[0].step_b_count),
      pendingDeadlines: parseInt(pendingDeadlines.rows[0].count)
    });
  } catch (error) {
    console.error('Get statistics error:', error);
    res.status(500).json({ error: { message: 'Failed to fetch statistics' } });
  }
};
