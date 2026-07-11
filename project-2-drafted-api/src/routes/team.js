const express = require('express');
const router = express.Router();
const store = require('../data/store');

/**
 * GET /api/team
 * Optional ?availability=available|busy|off to filter.
 * Read-only on purpose — the brief doesn't ask for team management,
 * and not every resource in a real API needs every HTTP method.
 */
router.get('/', (req, res) => {
  const { availability } = req.query;
  const result = availability
    ? store.team.filter((member) => member.availability === availability)
    : store.team;
  res.status(200).json(result);
});

router.get('/:id', (req, res) => {
  const id = Number(req.params.id);
  const member = store.team.find((m) => m.id === id);

  if (!member) {
    return res.status(404).json({ error: { message: `Team member ${req.params.id} not found.` } });
  }
  res.status(200).json(member);
});

module.exports = router;
