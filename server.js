const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'equipment.json');

const STATUSES = ['Available', 'In use', 'Under repair'];

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.redirect('/dashboard.html');
});

// Pure-UI preview: same look, but buttons only navigate between pages
// (no fetch calls, no data persistence). Served from public/mockup.
app.use('/mockup', express.static(path.join(__dirname, 'public', 'mockup')));
app.get('/mockup', (req, res) => {
  res.redirect('/mockup/dashboard.html');
});

function readData() {
  const raw = fs.readFileSync(DATA_FILE, 'utf8');
  return JSON.parse(raw);
}

function writeData(records) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(records, null, 2));
}

function trim(value) {
  return typeof value === 'string' ? value.trim() : value;
}

function validate(body, records, idToExclude) {
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

  const duplicate = records.some(
    (r) =>
      r.id !== idToExclude &&
      r.assetTag.toLowerCase() === assetTag.toLowerCase()
  );
  if (duplicate) {
    return { error: `Asset tag "${assetTag}" is already in use.`, duplicate: true };
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

app.get('/api/equipment', (req, res) => {
  res.json(readData());
});

app.get('/api/equipment/:id', (req, res) => {
  const record = readData().find((r) => r.id === req.params.id);
  if (!record) return res.status(404).json({ error: 'Record not found.' });
  res.json(record);
});

app.post('/api/equipment', (req, res) => {
  const records = readData();
  const result = validate(req.body, records, null);
  if (result.error) {
    return res.status(result.duplicate ? 409 : 400).json({ error: result.error });
  }

  const now = new Date().toISOString();
  const record = {
    id: crypto.randomUUID(),
    ...result.value,
    createdAt: now,
    updatedAt: now,
  };

  records.push(record);
  writeData(records);
  res.status(201).json(record);
});

app.put('/api/equipment/:id', (req, res) => {
  const records = readData();
  const index = records.findIndex((r) => r.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Record not found.' });

  const result = validate(req.body, records, req.params.id);
  if (result.error) {
    return res.status(result.duplicate ? 409 : 400).json({ error: result.error });
  }

  const updated = {
    ...records[index],
    ...result.value,
    updatedAt: new Date().toISOString(),
  };

  records[index] = updated;
  writeData(records);
  res.json(updated);
});

app.delete('/api/equipment/:id', (req, res) => {
  const records = readData();
  const index = records.findIndex((r) => r.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Record not found.' });

  records.splice(index, 1);
  writeData(records);
  res.status(204).end();
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
