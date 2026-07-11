const express = require('express');
const router = express.Router();
const store = require('../data/store');
const { validateProjectInput, ALLOWED_PROJECT_STATUSES } = require('../validation/validators');

/**
 * GET /api/projects
 * Optional ?status=on-track|at-risk|ahead to filter.
 * Demonstrates handling of query-string input, not just POST bodies.
 */
router.get('/', (req, res) => {
  const { status } = req.query;

  if (status !== undefined && !ALLOWED_PROJECT_STATUSES.includes(status)) {
    return res.status(400).json({
      error: { message: `status must be one of: ${ALLOWED_PROJECT_STATUSES.join(', ')}.` },
    });
  }

  const result = status ? store.projects.filter((p) => p.status === status) : store.projects;
  res.status(200).json(result);
});

/**
 * GET /api/projects/:id
 */
router.get('/:id', (req, res) => {
  const id = Number(req.params.id);
  const project = store.projects.find((p) => p.id === id);

  if (!project) {
    return res.status(404).json({ error: { message: `Project ${req.params.id} not found.` } });
  }
  res.status(200).json(project);
});

/**
 * GET /api/projects/:id/tasks
 * Nested resource — the tasks that belong to one project.
 */
router.get('/:id/tasks', (req, res) => {
  const id = Number(req.params.id);
  const project = store.projects.find((p) => p.id === id);

  if (!project) {
    return res.status(404).json({ error: { message: `Project ${req.params.id} not found.` } });
  }
  const projectTasks = store.tasks.filter((t) => t.projectId === id);
  res.status(200).json(projectTasks);
});

/**
 * POST /api/projects
 * Creates a new project. Returns 201 + the created resource on success,
 * 400 with a list of validation errors on failure.
 */
router.post('/', (req, res) => {
  const errors = validateProjectInput(req.body);
  if (errors.length) {
    return res.status(400).json({ error: { message: 'Validation failed.', details: errors } });
  }

  const project = {
    id: store.getNextProjectId(),
    name: req.body.name.trim(),
    client: req.body.client.trim(),
    status: req.body.status || 'on-track',
    progress: req.body.progress !== undefined ? Number(req.body.progress) : 0,
    dueDate: req.body.dueDate || null,
  };
  store.projects.push(project);
  res.status(201).json(project);
});

/**
 * PATCH /api/projects/:id
 * Partial update — only the fields sent are validated and changed.
 */
router.patch('/:id', (req, res) => {
  const id = Number(req.params.id);
  const project = store.projects.find((p) => p.id === id);

  if (!project) {
    return res.status(404).json({ error: { message: `Project ${req.params.id} not found.` } });
  }

  const errors = validateProjectInput(req.body, { partial: true });
  if (errors.length) {
    return res.status(400).json({ error: { message: 'Validation failed.', details: errors } });
  }

  Object.assign(project, req.body);
  res.status(200).json(project);
});

/**
 * DELETE /api/projects/:id
 * Returns 204 No Content on success — nothing meaningful to send back.
 */
router.delete('/:id', (req, res) => {
  const id = Number(req.params.id);
  const index = store.projects.findIndex((p) => p.id === id);

  if (index === -1) {
    return res.status(404).json({ error: { message: `Project ${req.params.id} not found.` } });
  }

  store.projects.splice(index, 1);
  res.status(204).send();
});

module.exports = router;
