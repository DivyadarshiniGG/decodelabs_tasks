const express = require('express');
const router = express.Router();
const db = require('../db/connection');

router.get('/', (req, res) => {
  const { availability } = req.query;
  const rows = availability
    ? db.prepare('SELECT * FROM team WHERE availability = ?').all(availability)
    : db.prepare('SELECT * FROM team').all();
  res.status(200).json(rows);
});

router.get('/:id', (req, res) => {
  const member = db.prepare('SELECT * FROM team WHERE id = ?').get(req.params.id);
  if (!member) return res.status(404).json({ error: { message: `Team member ${req.params.id} not found.` } });
  res.status(200).json(member);
});

module.exports = router;
