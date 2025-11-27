import express from 'express';
import multer from 'multer';
import path from 'path';
import { authenticate } from '../middleware/auth.js';
import { requireActiveSubscription } from '../middleware/subscription.js';
import pool from '../config/database.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760 // 10MB default
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx|txt/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only images, PDFs, and documents are allowed'));
    }
  }
});

router.use(authenticate);
router.use(requireActiveSubscription);

// Upload document to a grievance
router.post('/:grievanceId', upload.single('file'), async (req, res) => {
  try {
    const { grievanceId } = req.params;
    const { label, description } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: { message: 'No file uploaded' } });
    }

    const result = await pool.query(
      `INSERT INTO documents
        (grievance_id, uploaded_by, file_name, file_path, file_type, file_size, label, description)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        grievanceId,
        req.user.userId,
        req.file.originalname,
        req.file.path,
        req.file.mimetype,
        req.file.size,
        label || req.file.originalname,
        description || null
      ]
    );

    res.status(201).json({
      message: 'Document uploaded successfully',
      document: result.rows[0]
    });
  } catch (error) {
    console.error('Upload document error:', error);
    res.status(500).json({ error: { message: 'Failed to upload document' } });
  }
});

// Get documents for a grievance
router.get('/:grievanceId', async (req, res) => {
  try {
    const { grievanceId } = req.params;

    const result = await pool.query(
      `SELECT d.*, u.first_name || ' ' || u.last_name as uploaded_by_name
       FROM documents d
       LEFT JOIN users u ON d.uploaded_by = u.id
       WHERE d.grievance_id = $1
       ORDER BY d.created_at DESC`,
      [grievanceId]
    );

    res.json({ documents: result.rows });
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({ error: { message: 'Failed to fetch documents' } });
  }
});

// Delete a document
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM documents WHERE id = $1 AND uploaded_by = $2 RETURNING *',
      [id, req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: { message: 'Document not found or unauthorized' } });
    }

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({ error: { message: 'Failed to delete document' } });
  }
});

export default router;
