const express = require('express');
const router = express.Router();
const db = require('../db/connection');
const { validateProjectInput, ALLOWED_PROJECT_STATUSES } = require('../validation/validators');

router.get('/', (req, res) => {
  const { status } = req.query;
  if (status !== undefined && !ALLOWED_PROJECT_STATUSES.includes(status)) {
    return res.status(400).json({ error: { message: `status must be one of: ${ALLOWED_PROJECT_STATUSES.join(', ')}.` } });
  }
  const rows = status
    ? db.prepare('SELECT * FROM projects WHERE status = ?').all(status)
    : db.prepare('SELECT * FROM projects').all();
  res.status(200).json(rows);
});

router.get('/:id', (req, res) => {
  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id);
  if (!project) return res.status(404).json({ error: { message: `Project ${req.params.id} not found.` } });
  res.status(200).json(project);
});

router.get('/:id/tasks', (req, res) => {
  const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id);
  if (!project) return res.status(404).json({ error: { message: `Project ${req.params.id} not found.` } });
  const tasks = db.prepare('SELECT * FROM tasks WHERE projectId = ?').all(req.params.id);
  res.status(200).json(tasks);
});

router.post('/', (req, res) => {
  const errors = validateProjectInput(req.body);
  if (errors.length) return res.status(400).json({ error: { message: 'Validation failed.', details: errors } });

  const { name, client, status = 'on-track', progress = 0, dueDate = null } = req.body;
  try {
    const result = db
      .prepare(`INSERT INTO projects (name, client, status, progress, dueDate) VALUES (?, ?, ?, ?, ?)`)
      .run(name.trim(), client.trim(), status, progress, dueDate);
    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ error: { message: 'Could not create project.' } });
  }
});

router.patch('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: { message: `Project ${req.params.id} not found.` } });

  const errors = validateProjectInput(req.body, { partial: true });
  if (errors.length) return res.status(400).json({ error: { message: 'Validation failed.', details: errors } });

  const updated = { ...existing, ...req.body };
  db.prepare(`UPDATE projects SET name = ?, client = ?, status = ?, progress = ?, dueDate = ? WHERE id = ?`)
    .run(updated.name, updated.client, updated.status, updated.progress, updated.dueDate, req.params.id);

  res.status(200).json(db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id));
});

router.delete('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: { message: `Project ${req.params.id} not found.` } });
  db.prepare('DELETE FROM projects WHERE id = ?').run(req.params.id); // cascades to its tasks
  res.status(204).send();
});

module.exports = router;
