const express = require('express');
const router = express.Router();
const medicineController = require('../controllers/medicineController');
const authMiddleware = require('../middleware/authMiddleware');

// Protect all routes
router.use(authMiddleware);

// Add a medicine
router.post('/', medicineController.addMedicine);

// Get all medicines
router.get('/', medicineController.getAllMedicines);

// Update a medicine
router.put('/:id', medicineController.updateMedicine);

// Delete a medicine
router.delete('/:id', medicineController.deleteMedicine);

// Get specific medicine
router.get('/:id', medicineController.getMedicineById);

module.exports = router;
