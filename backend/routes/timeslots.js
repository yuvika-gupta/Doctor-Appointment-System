const express = require('express');
const router = express.Router();
const { getTimeslots, createTimeslot, updateTimeslot, deleteTimeslot } = require('../controllers/timeslotController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, getTimeslots);
router.post('/', authMiddleware, createTimeslot);
router.put('/:id', authMiddleware, updateTimeslot);
router.delete('/:id', authMiddleware, deleteTimeslot);

module.exports = router;
