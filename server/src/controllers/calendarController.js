import pool from '../config/database.js';

/**
 * Generate an iCal (.ics) feed of the user's grievance deadlines.
 * Subscribe via Google Calendar / Outlook / Apple Calendar.
 */
export const getCalendarFeed = async (req, res) => {
  try {
    const userId = req.user.userId;
    const userRole = req.user.role;

    let query;
    let params;

    if (userRole === 'representative') {
      query = `SELECT d.*, g.grievance_number, g.violation_type, g.contract_article, g.facility
               FROM deadlines d
               JOIN grievances g ON d.grievance_id = g.id
               WHERE d.is_completed = false AND g.status = 'active'
               ORDER BY d.deadline_date ASC
               LIMIT 100`;
      params = [];
    } else if (userRole === 'steward') {
      query = `SELECT d.*, g.grievance_number, g.violation_type, g.contract_article, g.facility
               FROM deadlines d
               JOIN grievances g ON d.grievance_id = g.id
               WHERE (g.user_id = $1 OR g.steward_assigned = $1)
                 AND d.is_completed = false AND g.status = 'active'
               ORDER BY d.deadline_date ASC
               LIMIT 100`;
      params = [userId];
    } else {
      query = `SELECT d.*, g.grievance_number, g.violation_type, g.contract_article, g.facility
               FROM deadlines d
               JOIN grievances g ON d.grievance_id = g.id
               WHERE g.user_id = $1
                 AND d.is_completed = false AND g.status = 'active'
               ORDER BY d.deadline_date ASC
               LIMIT 100`;
      params = [userId];
    }

    const result = await pool.query(query, params);

    // Build iCal
    const now = new Date();
    const formatDate = (d) => {
      const date = new Date(d);
      return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    };

    let ical = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//UnionCase//Grievance Deadlines//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'X-WR-CALNAME:UnionCase Deadlines',
      'X-WR-TIMEZONE:America/New_York',
    ];

    for (const d of result.rows) {
      const deadlineDate = new Date(d.deadline_date);
      // Make it an all-day event
      const dateStr = deadlineDate.toISOString().slice(0, 10).replace(/-/g, '');
      const nextDay = new Date(deadlineDate);
      nextDay.setDate(nextDay.getDate() + 1);
      const nextDateStr = nextDay.toISOString().slice(0, 10).replace(/-/g, '');

      ical.push('BEGIN:VEVENT');
      ical.push(`UID:deadline-${d.id}@unioncase`);
      ical.push(`DTSTAMP:${formatDate(now)}`);
      ical.push(`DTSTART;VALUE=DATE:${dateStr}`);
      ical.push(`DTEND;VALUE=DATE:${nextDateStr}`);
      ical.push(`SUMMARY:${d.deadline_type} - ${d.grievance_number}`);
      ical.push(`DESCRIPTION:${d.description || d.deadline_type} for case ${d.grievance_number} (${d.violation_type})\\nFacility: ${d.facility || 'N/A'}\\nArticle: ${d.contract_article || 'N/A'}`);
      // Reminder 3 days before
      ical.push('BEGIN:VALARM');
      ical.push('TRIGGER:-P3D');
      ical.push('ACTION:DISPLAY');
      ical.push(`DESCRIPTION:Deadline in 3 days: ${d.deadline_type} - ${d.grievance_number}`);
      ical.push('END:VALARM');
      // Reminder 1 day before
      ical.push('BEGIN:VALARM');
      ical.push('TRIGGER:-P1D');
      ical.push('ACTION:DISPLAY');
      ical.push(`DESCRIPTION:Deadline tomorrow: ${d.deadline_type} - ${d.grievance_number}`);
      ical.push('END:VALARM');
      ical.push('END:VEVENT');
    }

    ical.push('END:VCALENDAR');

    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="unioncase-deadlines.ics"');
    res.send(ical.join('\r\n'));
  } catch (error) {
    console.error('Calendar feed error:', error);
    res.status(500).json({ error: { message: 'Failed to generate calendar feed' } });
  }
};
