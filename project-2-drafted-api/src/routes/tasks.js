const express = require('express');
const router = express.Router();
const store = require('../data/store');
const { validateTaskInput } = require('../validation/validators');

/**
 * GET /api/tasks
 * Optional ?completed=true|false to filter.
 */
router.get('/', (req, res) => {
  const { completed } = req.query;

  if (completed !== undefined && completed !== 'true' && completed !== 'false') {
    return res.status(400).json({ error: { message: 'completed must be "true" or "false".' } });
  }

  const result =
    completed === undefined
      ? store.tasks
      : store.tasks.filter((t) => t.completed === (completed === 'true'));

  res.status(200).json(result);
});

/**
 * GET /api/tasks/:id
 */
router.get('/:id', (req, res) => {
  const id = Number(req.params.id);
  const task = store.tasks.find((t) => t.id === id);

  if (!task) {
    return res.status(404).json({ error: { message: `Task ${req.params.id} not found.` } });
  }
  res.status(200).json(task);
});

/**
 * POST /api/tasks
 * If projectId is provided, it must reference a real project (referential
 * integrity check) — this is the kind of "semantic validation" the brief
 * distinguishes from just checking the JSON shape is correct.
 */
router.post('/', (req, res) => {
  const errors = validateTaskInput(req.body);

  if (req.body && req.body.projectId !== undefined) {
    const projectExists = store.projects.some((p) => p.id === Number(req.body.projectId));
    if (!projectExists) {
      errors.push(`projectId ${req.body.projectId} does not match any existing project.`);
    }
  }

  if (errors.length) {
    return res.status(400).json({ error: { message: 'Validation failed.', details: errors } });
  }

  const task = {
    id: store.getNextTaskId(),
    text: req.body.text.trim(),
    completed: req.body.completed === true,
    projectId: req.body.projectId !== undefined ? Number(req.body.projectId) : null,
  };
  store.tasks.push(task);
  res.status(201).json(task);
});

/**
 * PATCH /api/tasks/:id
 * Used for both editing text and toggling completed.
 */
router.patch('/:id', (req, res) => {
  const id = Number(req.params.id);
  const task = store.tasks.find((t) => t.id === id);

  if (!task) {
    return res.status(404).json({ error: { message: `Task ${req.params.id} not found.` } });
  }

  const errors = validateTaskInput(req.body, { partial: true });
  if (errors.length) {
    return res.status(400).json({ error: { message: 'Validation failed.', details: errors } });
  }

  Object.assign(task, req.body);
  res.status(200).json(task);
});

/**
 * DELETE /api/tasks/:id
 */
router.delete('/:id', (req, res) => {
  const id = Number(req.params.id);
  const index = store.tasks.findIndex((t) => t.id === id);

  if (index === -1) {
    return res.status(404).json({ error: { message: `Task ${req.params.id} not found.` } });
  }

  store.tasks.splice(index, 1);
  res.status(204).send();
});

module.exports = router;
