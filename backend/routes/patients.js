const express = require('express');
const router = express.Router();
const { getPatients, getPatientById, createPatient, updatePatient, deletePatient } = require('../controllers/patientController');
const authMiddleware = require('../middleware/authMiddleware');
const roleCheck = require('../middleware/roleCheck');

router.get('/', authMiddleware, getPatients);
router.get('/:id', authMiddleware, getPatientById);
router.post('/', authMiddleware, createPatient);
router.put('/:id', authMiddleware, updatePatient);
router.delete('/:id', authMiddleware, roleCheck(['admin']), deletePatient);

module.exports = router;
