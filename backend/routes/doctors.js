const express = require('express');
const router = express.Router();
const { getDoctors, getDoctorById, updateDoctor, deleteDoctor } = require('../controllers/doctorController');
const authMiddleware = require('../middleware/authMiddleware');
const roleCheck = require('../middleware/roleCheck');

router.get('/', authMiddleware, getDoctors);
router.get('/:id', authMiddleware, getDoctorById);
router.put('/:id', authMiddleware, roleCheck(['admin', 'doctor']), updateDoctor);
router.delete('/:id', authMiddleware, roleCheck(['admin']), deleteDoctor);

module.exports = router;
