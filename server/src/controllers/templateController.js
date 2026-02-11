import pool from '../config/database.js';

export const getTemplates = async (req, res) => {
  try {
    const { unionType } = req.query;

    let query = `SELECT * FROM case_templates WHERE is_system = true`;
    const params = [];

    if (unionType) {
      query += ` AND (union_type = $1 OR union_type IS NULL)`;
      params.push(unionType);
    }

    query += ` ORDER BY name ASC`;

    const result = await pool.query(query, params);
    res.json({ templates: result.rows });
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({ error: { message: 'Failed to fetch templates' } });
  }
};

export const getTemplateById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM case_templates WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: { message: 'Template not found' } });
    }

    res.json({ template: result.rows[0] });
  } catch (error) {
    console.error('Get template error:', error);
    res.status(500).json({ error: { message: 'Failed to fetch template' } });
  }
};
