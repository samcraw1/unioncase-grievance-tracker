import express from 'express';
import { body } from 'express-validator';
import {
  createGrievance,
  getGrievances,
  getGrievanceById,
  updateGrievanceStep,
  addNote,
  getStatistics
} from '../controllers/grievanceController.js';
import { authenticate } from '../middleware/auth.js';
import { generateGrievancePDF } from '../services/pdfService.js';
import pool from '../config/database.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Validation
const grievanceValidation = [
  body('grievantName').notEmpty().withMessage('Grievant name is required'),
  body('facility').notEmpty().withMessage('Facility is required'),
  body('incidentDate').isDate().withMessage('Valid incident date is required'),
  body('contractArticle').notEmpty().withMessage('Contract article is required'),
  body('violationType').notEmpty().withMessage('Violation type is required'),
  body('briefDescription').notEmpty().withMessage('Brief description is required'),
  body('detailedDescription').notEmpty().withMessage('Detailed description is required'),
];

// PDF Export endpoint
router.get('/:id/export-pdf', async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch complete grievance data with all related information
    const grievanceResult = await pool.query(
      `SELECT g.*
       FROM grievances g
       WHERE g.id = $1`,
      [id]
    );

    if (grievanceResult.rows.length === 0) {
      return res.status(404).json({ error: { message: 'Grievance not found' } });
    }

    const grievance = grievanceResult.rows[0];

    // Fetch timeline
    const timelineResult = await pool.query(
      `SELECT * FROM grievance_timeline
       WHERE grievance_id = $1
       ORDER BY step_date ASC`,
      [id]
    );
    grievance.timeline = timelineResult.rows;

    // Fetch deadlines
    const deadlinesResult = await pool.query(
      `SELECT * FROM deadlines
       WHERE grievance_id = $1
       ORDER BY deadline_date ASC`,
      [id]
    );
    grievance.deadlines = deadlinesResult.rows;

    // Fetch notes
    const notesResult = await pool.query(
      `SELECT n.*, u.first_name || ' ' || u.last_name as author_name
       FROM notes n
       LEFT JOIN users u ON n.author_id = u.id
       WHERE n.grievance_id = $1
       ORDER BY n.created_at ASC`,
      [id]
    );
    grievance.notes = notesResult.rows;

    // Set response headers for PDF download
    const filename = `Grievance_${grievance.grievance_number}_${Date.now()}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // Generate and stream PDF
    await generateGrievancePDF(grievance, res);
  } catch (error) {
    console.error('PDF export error:', error);
    res.status(500).json({ error: { message: 'Failed to generate PDF' } });
  }
});

// Routes
router.post('/', grievanceValidation, createGrievance);
router.get('/', getGrievances);
router.get('/statistics', getStatistics);
router.get('/:id', getGrievanceById);
router.patch('/:id/step', updateGrievanceStep);
router.post('/:id/notes', addNote);

export default router;
