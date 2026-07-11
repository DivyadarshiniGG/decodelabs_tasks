const express = require('express');
const router = express.Router();
const db = require('../db/connection');
const { validateTaskInput } = require('../validation/validators');

router.get('/', (req, res) => {
  const { completed } = req.query;
  if (completed !== undefined && completed !== 'true' && completed !== 'false') {
    return res.status(400).json({ error: { message: 'completed must be "true" or "false".' } });
  }
  const rows =
    completed === undefined
      ? db.prepare('SELECT * FROM tasks').all()
      : db.prepare('SELECT * FROM tasks WHERE completed = ?').all(completed === 'true' ? 1 : 0);
  res.status(200).json(rows);
});

router.get('/:id', (req, res) => {
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
  if (!task) return res.status(404).json({ error: { message: `Task ${req.params.id} not found.` } });
  res.status(200).json(task);
});

router.post('/', (req, res) => {
  const errors = validateTaskInput(req.body);

  if (req.body && req.body.projectId !== undefined && req.body.projectId !== null) {
    const projectExists = db.prepare('SELECT 1 FROM projects WHERE id = ?').get(req.body.projectId);
    if (!projectExists) errors.push(`projectId ${req.body.projectId} does not match any existing project.`);
  }
  if (errors.length) return res.status(400).json({ error: { message: 'Validation failed.', details: errors } });

  const { text, completed = false, projectId = null } = req.body;
  const result = db
    .prepare('INSERT INTO tasks (text, completed, projectId) VALUES (?, ?, ?)')
    .run(text.trim(), completed ? 1 : 0, projectId);
  res.status(201).json(db.prepare('SELECT * FROM tasks WHERE id = ?').get(result.lastInsertRowid));
});

router.patch('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: { message: `Task ${req.params.id} not found.` } });

  const errors = validateTaskInput(req.body, { partial: true });
  if (errors.length) return res.status(400).json({ error: { message: 'Validation failed.', details: errors } });

  const updated = { ...existing, ...req.body };
  db.prepare('UPDATE tasks SET text = ?, completed = ?, projectId = ? WHERE id = ?')
    .run(updated.text, updated.completed ? 1 : 0, updated.projectId, req.params.id);

  res.status(200).json(db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id));
});

router.delete('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: { message: `Task ${req.params.id} not found.` } });
  db.prepare('DELETE FROM tasks WHERE id = ?').run(req.params.id);
  res.status(204).send();
});

module.exports = router;
