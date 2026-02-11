import pool from '../config/database.js';

/**
 * Steward Workload Dashboard — returns a prioritized summary of all cases,
 * overdue actions, upcoming deadlines, and case aging for stewards/reps.
 */
export const getStewardWorkload = async (req, res) => {
  try {
    const userId = req.user.userId;
    const userRole = req.user.role;

    if (userRole === 'employee') {
      return res.status(403).json({ error: { message: 'Steward or representative role required' } });
    }

    const accessFilter = userRole === 'representative'
      ? ''
      : `AND (g.user_id = $1 OR g.steward_assigned = $1)`;
    const params = userRole === 'representative' ? [] : [userId];

    // 1. Summary stats
    const statsResult = await pool.query(`
      SELECT
        COUNT(*) FILTER (WHERE g.status = 'active') as active_cases,
        COUNT(*) FILTER (WHERE g.status = 'resolved' OR g.status = 'settled') as closed_cases,
        COUNT(*) FILTER (WHERE g.status = 'active' AND g.current_step IN ('arbitration')) as at_arbitration,
        COUNT(*) as total_cases
      FROM grievances g
      WHERE 1=1 ${accessFilter}
    `, params);

    // 2. Urgent deadlines (next 7 days)
    const deadlinesResult = await pool.query(`
      SELECT d.id, d.deadline_type, d.deadline_date, d.description,
             g.id as grievance_id, g.grievance_number, g.violation_type, g.current_step,
             g.grievant_name, g.facility
      FROM deadlines d
      JOIN grievances g ON d.grievance_id = g.id
      WHERE d.is_completed = false
        AND d.deadline_date >= CURRENT_DATE
        AND d.deadline_date <= CURRENT_DATE + interval '7 days'
        AND g.status = 'active'
        ${accessFilter}
      ORDER BY d.deadline_date ASC
      LIMIT 20
    `, params);

    // 3. Overdue deadlines
    const overdueResult = await pool.query(`
      SELECT d.id, d.deadline_type, d.deadline_date, d.description,
             g.id as grievance_id, g.grievance_number, g.violation_type, g.current_step,
             g.grievant_name, g.facility
      FROM deadlines d
      JOIN grievances g ON d.grievance_id = g.id
      WHERE d.is_completed = false
        AND d.deadline_date < CURRENT_DATE
        AND g.status = 'active'
        ${accessFilter}
      ORDER BY d.deadline_date ASC
      LIMIT 20
    `, params);

    // 4. Stale cases (no update in 7+ days)
    const staleResult = await pool.query(`
      SELECT g.id, g.grievance_number, g.violation_type, g.current_step,
             g.grievant_name, g.facility, g.updated_at,
             EXTRACT(DAY FROM NOW() - g.updated_at)::int as days_stale
      FROM grievances g
      WHERE g.status = 'active'
        AND g.current_step NOT IN ('resolved', 'settled', 'denied', 'withdrawn')
        AND g.updated_at < NOW() - interval '7 days'
        ${accessFilter}
      ORDER BY g.updated_at ASC
      LIMIT 15
    `, params);

    // 5. Cases by step (distribution)
    const stepDistResult = await pool.query(`
      SELECT g.current_step, COUNT(*) as count
      FROM grievances g
      WHERE g.status = 'active'
        ${accessFilter}
      GROUP BY g.current_step
      ORDER BY count DESC
    `, params);

    // 6. Cases by violation type (for CBA prep)
    const violationDistResult = await pool.query(`
      SELECT g.violation_type, g.contract_article, COUNT(*) as count
      FROM grievances g
      WHERE g.status = 'active'
        ${accessFilter}
      GROUP BY g.violation_type, g.contract_article
      ORDER BY count DESC
      LIMIT 10
    `, params);

    // 7. Recent activity (last 10 timeline entries)
    const activityResult = await pool.query(`
      SELECT t.step, t.step_date, t.notes,
             g.grievance_number, g.id as grievance_id,
             u.first_name || ' ' || u.last_name as handler_name
      FROM grievance_timeline t
      JOIN grievances g ON t.grievance_id = g.id
      LEFT JOIN users u ON t.handler_id = u.id
      WHERE 1=1 ${accessFilter}
      ORDER BY t.step_date DESC
      LIMIT 10
    `, params);

    res.json({
      stats: statsResult.rows[0],
      urgentDeadlines: deadlinesResult.rows,
      overdueDeadlines: overdueResult.rows,
      staleCases: staleResult.rows,
      stepDistribution: stepDistResult.rows,
      violationDistribution: violationDistResult.rows,
      recentActivity: activityResult.rows,
    });
  } catch (error) {
    console.error('Steward workload error:', error);
    res.status(500).json({ error: { message: 'Failed to fetch workload data' } });
  }
};
