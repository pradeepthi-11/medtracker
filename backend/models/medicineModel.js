const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    medicine_name: {
        type: String,
        required: true
    },
    times_per_day: {
        type: Number,
        required: true,
        min: 1,
        max: 6
    },
    meal_option: {
        type: String,
        required: true,
        enum: ['Before Meal', 'After Meal', 'During Meals']
    },
    start_date: {
        type: String, // Storing as string to match existing frontend date format YYYY-MM-DD
        required: true
    },
    end_date: {
        type: String,
        default: null
    },
    dose_times: {
        type: [String],
        default: []
    }
}, { timestamps: true });

// Transform _id to medicine_id for frontend compatibility
medicineSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
        ret.medicine_id = ret._id.toString();
        delete ret._id;
    }
});

const Medicine = mongoose.model('Medicine', medicineSchema);

const normalizeDate = (dateStr) => {
    if (!dateStr || dateStr === '') return null;
    
    // If it's DD/MM/YYYY, convert to YYYY-MM-DD
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
        const [day, month, year] = dateStr.split('/');
        return `${year}-${month}-${day}`;
    }
    
    // Ensure YYYY-M-D becomes YYYY-MM-DD
    if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(dateStr)) {
        const [y, m, d] = dateStr.split('-');
        return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    }

    return dateStr;
};

const medicineModel = {
    getAllMedicines: async (userId) => {
        return await Medicine.find({ user_id: userId }).sort({ start_date: -1 });
    },

    getMedicineById: async (id, userId) => {
        return await Medicine.findOne({ _id: id, user_id: userId });
    },

    addMedicine: async (userId, medicineData) => {
        const normalizedData = {
            ...medicineData,
            user_id: userId,
            start_date: normalizeDate(medicineData.start_date),
            end_date: normalizeDate(medicineData.end_date) || null
        };
        const medicine = new Medicine(normalizedData);
        return await medicine.save();
    },

    updateMedicine: async (id, userId, medicineData) => {
        const normalizedData = {
            ...medicineData,
            start_date: normalizeDate(medicineData.start_date),
            end_date: normalizeDate(medicineData.end_date) || null
        };
        return await Medicine.findOneAndUpdate({ _id: id, user_id: userId }, normalizedData, { new: true });
    },

    deleteMedicine: async (id, userId) => {
        // Delete related tracking before deleting the medicine
        const Tracking = mongoose.model('Tracking'); 
        await Tracking.deleteMany({ medicine_id: id, user_id: userId });
        return await Medicine.findOneAndDelete({ _id: id, user_id: userId });
    }
};

module.exports = medicineModel;
