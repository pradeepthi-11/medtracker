require('dotenv').config();
const mongoose = require('mongoose');
require('./models/medicineModel');

const normalizeDate = (dateStr) => {
    if (!dateStr) return null;
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
        const [day, month, year] = dateStr.split('/');
        return `${year}-${month}-${day}`;
    }
    return dateStr;
};

async function cleanup() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB for cleanup');
        
        const Medicine = mongoose.model('Medicine');
        const medicines = await Medicine.find();
        
        console.log(`Checking ${medicines.length} medicines...`);
        
        for (const med of medicines) {
            let needsUpdate = false;
            let newStart = normalizeDate(med.start_date);
            let newEnd = normalizeDate(med.end_date);
            
            // Check if end_date was mistakenly set to a past date (like yesterday)
            // For this cleanup, we'll just clear end_dates that are earlier than start_date
            if (newStart && newEnd && newEnd < newStart) {
                console.log(`Fixing illogical end_date for ${med.medicine_name}: ${newEnd} -> null`);
                newEnd = null;
                needsUpdate = true;
            }

            if (newStart !== med.start_date || newEnd !== med.end_date) {
                needsUpdate = true;
            }
            
            if (needsUpdate) {
                console.log(`Updating ${med.medicine_name}: Start [${med.start_date} -> ${newStart}], End [${med.end_date} -> ${newEnd}]`);
                await Medicine.findByIdAndUpdate(med._id, { 
                    start_date: newStart, 
                    end_date: newEnd 
                });
            }
        }
        
        console.log('Cleanup completed successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Cleanup failed:', err);
        process.exit(1);
    }
}

cleanup();
