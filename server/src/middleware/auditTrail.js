import pool from '../config/database.js';

/**
 * Log an action to the immutable audit trail.
 * This is a utility function, not middleware — call it directly from controllers.
 */
export async function logAudit(userId, action, entityType, entityId, details = {}, ipAddress = null) {
  try {
    await pool.query(
      `INSERT INTO audit_trail (user_id, action, entity_type, entity_id, details, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [userId, action, entityType, entityId, JSON.stringify(details), ipAddress]
    );
  } catch (error) {
    // Never let audit logging break the main flow — log and continue
    console.error('Audit trail logging failed:', error.message);
  }
}

/**
 * Express middleware that auto-logs requests for specific routes.
 * Attach to routes where you want automatic audit logging.
 */
export function auditMiddleware(action, entityType) {
  return (req, res, next) => {
    // Store original json to intercept the response
    const originalJson = res.json.bind(res);
    res.json = (data) => {
      // Only log successful responses
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const entityId = req.params?.id || req.params?.grievanceId || data?.grievance?.id || data?.id;
        const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
        logAudit(req.user?.userId, action, entityType, entityId, {}, ip);
      }
      return originalJson(data);
    };
    next();
  };
}
