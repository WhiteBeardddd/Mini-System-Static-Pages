const express = require('express');
const mysql = require('mysql2/promise');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

const STATUSES = ['Available', 'In use', 'Under repair'];

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.redirect('/dashboard.html');
});

// MySQL connection (XAMPP defaults: user "root", empty password).
const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'equipment_db',
  timezone: 'Z', // store and read DATETIME values as UTC
});

// Convert a database row (snake_case) to the JSON shape the frontend uses.
function toRecord(row) {
  return {
    id: row.id,
    assetTag: row.asset_tag,
    name: row.name,
    category: row.category,
    location: row.location || '',
    status: row.status,
    notes: row.notes || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function findById(id) {
  const [rows] = await db.query('SELECT * FROM equipment WHERE id = ?', [id]);
  return rows.length ? toRecord(rows[0]) : null;
}

function trim(value) {
  return typeof value === 'string' ? value.trim() : value;
}

function validate(body) {
  const assetTag = trim(body.assetTag);
  const name = trim(body.name);
  const category = trim(body.category);
  const status = trim(body.status);

  if (!assetTag) return { error: 'Asset tag is required.' };
  if (!name) return { error: 'Name is required.' };
  if (!category) return { error: 'Category is required.' };
  if (!status) return { error: 'Status is required.' };
  if (!STATUSES.includes(status)) {
    return { error: `Status must be one of: ${STATUSES.join(', ')}.` };
  }

  return {
    value: {
      assetTag,
      name,
      category,
      location: trim(body.location) || '',
      status,
      notes: trim(body.notes) || '',
    },
  };
}

// The UNIQUE index on asset_tag rejects duplicates (case-insensitive collation).
function isDuplicate(err) {
  return err && err.code === 'ER_DUP_ENTRY';
}

function duplicateError(res, assetTag) {
  return res.status(409).json({ error: `Asset tag "${assetTag}" is already in use.` });
}

function serverError(res, err) {
  console.error(err);
  return res.status(500).json({ error: 'Database error. Is MySQL running in XAMPP?' });
}

app.get('/api/equipment', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM equipment ORDER BY created_at');
    res.json(rows.map(toRecord));
  } catch (err) {
    serverError(res, err);
  }
});

app.get('/api/equipment/:id', async (req, res) => {
  try {
    const record = await findById(req.params.id);
    if (!record) return res.status(404).json({ error: 'Record not found.' });
    res.json(record);
  } catch (err) {
    serverError(res, err);
  }
});

app.post('/api/equipment', async (req, res) => {
  const result = validate(req.body);
  if (result.error) return res.status(400).json({ error: result.error });

  const v = result.value;
  const id = crypto.randomUUID();
  const now = new Date();

  try {
    await db.query(
      `INSERT INTO equipment
        (id, asset_tag, name, category, location, status, notes, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, v.assetTag, v.name, v.category, v.location, v.status, v.notes, now, now]
    );
    res.status(201).json(await findById(id));
  } catch (err) {
    if (isDuplicate(err)) return duplicateError(res, v.assetTag);
    serverError(res, err);
  }
});

app.put('/api/equipment/:id', async (req, res) => {
  const result = validate(req.body);
  if (result.error) return res.status(400).json({ error: result.error });

  const v = result.value;

  try {
    const [info] = await db.query(
      `UPDATE equipment
       SET asset_tag = ?, name = ?, category = ?, location = ?, status = ?, notes = ?, updated_at = ?
       WHERE id = ?`,
      [v.assetTag, v.name, v.category, v.location, v.status, v.notes, new Date(), req.params.id]
    );
    if (info.affectedRows === 0) return res.status(404).json({ error: 'Record not found.' });
    res.json(await findById(req.params.id));
  } catch (err) {
    if (isDuplicate(err)) return duplicateError(res, v.assetTag);
    serverError(res, err);
  }
});

app.delete('/api/equipment/:id', async (req, res) => {
  try {
    const [info] = await db.query('DELETE FROM equipment WHERE id = ?', [req.params.id]);
    if (info.affectedRows === 0) return res.status(404).json({ error: 'Record not found.' });
    res.status(204).end();
  } catch (err) {
    serverError(res, err);
  }
});

app.listen(PORT, async () => {
  console.log(`Server running at http://localhost:${PORT}`);
  try {
    await db.query('SELECT 1');
    console.log('Connected to MySQL');
  } catch (err) {
    console.error('Database connection failed:', err.message);
  }
});
