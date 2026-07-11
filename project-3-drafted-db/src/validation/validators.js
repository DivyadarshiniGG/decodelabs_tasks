const ALLOWED_PROJECT_STATUSES = ['on-track', 'at-risk', 'ahead'];

function validateProjectInput(body, { partial = false } = {}) {
  const errors = [];
  if (!body || typeof body !== 'object') return ['Request body must be a JSON object.'];

  if (!partial || body.name !== undefined) {
    if (typeof body.name !== 'string' || body.name.trim().length === 0) {
      errors.push('name is required and must be a non-empty string.');
    }
  }
  if (!partial || body.client !== undefined) {
    if (typeof body.client !== 'string' || body.client.trim().length === 0) {
      errors.push('client is required and must be a non-empty string.');
    }
  }
  if (body.status !== undefined && !ALLOWED_PROJECT_STATUSES.includes(body.status)) {
    errors.push(`status must be one of: ${ALLOWED_PROJECT_STATUSES.join(', ')}.`);
  }
  if (body.progress !== undefined) {
    const progress = Number(body.progress);
    if (Number.isNaN(progress) || progress < 0 || progress > 100) {
      errors.push('progress must be a number between 0 and 100.');
    }
  }
  if (body.dueDate !== undefined && body.dueDate !== null && Number.isNaN(Date.parse(body.dueDate))) {
    errors.push('dueDate must be a valid date string, e.g. "2026-09-14".');
  }
  return errors;
}

function validateTaskInput(body, { partial = false } = {}) {
  const errors = [];
  if (!body || typeof body !== 'object') return ['Request body must be a JSON object.'];

  if (!partial || body.text !== undefined) {
    if (typeof body.text !== 'string' || body.text.trim().length === 0) {
      errors.push('text is required and must be a non-empty string.');
    }
  }
  if (body.completed !== undefined && typeof body.completed !== 'boolean') {
    errors.push('completed must be true or false.');
  }
  if (body.projectId !== undefined && body.projectId !== null && !Number.isInteger(Number(body.projectId))) {
    errors.push('projectId must be an integer.');
  }
  return errors;
}

module.exports = { validateProjectInput, validateTaskInput, ALLOWED_PROJECT_STATUSES };
