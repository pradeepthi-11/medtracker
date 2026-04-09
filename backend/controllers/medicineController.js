const medicineModel = require('../models/medicineModel');

const medicineController = {
    getAllMedicines: async (req, res) => {
        try {
            const medicines = await medicineModel.getAllMedicines(req.user.id);
            res.json({ success: true, count: medicines.length, data: medicines });
        } catch (error) {
            console.error('Error fetching medicines:', error);
            res.status(500).json({ success: false, message: 'Server Error' });
        }
    },

    getMedicineById: async (req, res) => {
        try {
             const medicine = await medicineModel.getMedicineById(req.params.id, req.user.id);
             if (!medicine) {
                 return res.status(404).json({ success: false, message: 'Medicine not found' });
             }
             res.json({ success: true, data: medicine });
        } catch (error) {
             console.error('Error fetching medicine by ID:', error);
             res.status(500).json({ success: false, message: 'Server Error' });
        }
    },

    addMedicine: async (req, res) => {
        try {
            const newMedicine = await medicineModel.addMedicine(req.user.id, req.body);
            res.status(201).json({ success: true, data: newMedicine });
        } catch (error) {
            console.error('Error adding medicine:', error);
            res.status(400).json({ success: false, message: 'Invalid data or Server Error' });
        }
    },

    updateMedicine: async (req, res) => {
        try {
            const updatedMedicine = await medicineModel.updateMedicine(req.params.id, req.user.id, req.body);
            res.json({ success: true, data: updatedMedicine });
        } catch (error) {
            console.error('Error updating medicine:', error);
            res.status(400).json({ success: false, message: 'Invalid data or Server Error' });
        }
    },

    deleteMedicine: async (req, res) => {
        try {
            await medicineModel.deleteMedicine(req.params.id, req.user.id);
            res.json({ success: true, message: 'Medicine deleted successfully' });
        } catch (error) {
            console.error('Error deleting medicine:', error);
            res.status(500).json({ success: false, message: 'Server Error' });
        }
    }
};

module.exports = medicineController;
