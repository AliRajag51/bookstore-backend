const express = require('express');
const router = express.Router();

// Placeholder routes for books
router.get('/', (req, res) => res.json({ message: 'List books (not implemented)' }));
router.get('/:id', (req, res) => res.json({ message: `Get book ${req.params.id} (not implemented)` }));

module.exports = router;
