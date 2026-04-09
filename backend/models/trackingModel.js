const mongoose = require('mongoose');

const trackingSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    medicine_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Medicine',
        required: true
    },
    date: {
        type: String, // YYYY-MM-DD
        required: true
    },
    dose_number: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: ['Pending', 'Taken', 'Missed'],
        default: 'Pending'
    }
}, { timestamps: true });

// Ensure unique combination of user, medicine, date, and dose
trackingSchema.index({ user_id: 1, medicine_id: 1, date: 1, dose_number: 1 }, { unique: true });

// Transform _id to track_id for frontend compatibility
trackingSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
        ret.track_id = ret._id.toString();
        delete ret._id;
    }
});

const Tracking = mongoose.model('Tracking', trackingSchema);

const trackingModel = {
    getDailyTracking: async (userId, date) => {
        const Medicine = mongoose.model('Medicine');
        
        // Normalize date format to YYYY-MM-DD
        if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(date)) {
            const [y, m, d] = date.split('-');
            date = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
        }

        console.log(`[Tracking] Fetching for user: ${userId}, date: ${date}`);

        // 1. Find active medicines for this date
        const activeMedicines = await Medicine.find({
            user_id: userId,
            start_date: { $lte: date },
            $or: [
                { end_date: null },
                { end_date: { $gte: date } }
            ]
        });

        // 2. Insert missing tracking records
        for (const med of activeMedicines) {
            const existingTracks = await Tracking.find({
                user_id: userId,
                medicine_id: med._id,
                date: date
            });

            if (existingTracks.length === 0) {
                // Generate doses
                const newTracks = [];
                for (let i = 1; i <= med.times_per_day; i++) {
                    newTracks.push({
                        user_id: userId,
                        medicine_id: med._id,
                        date: date,
                        dose_number: i,
                        status: 'Pending'
                    });
                }
                if (newTracks.length > 0) {
                    await Tracking.insertMany(newTracks);
                }
            } else if (existingTracks.length < med.times_per_day) {
                const currentMaxDose = Math.max(...existingTracks.map(t => t.dose_number), 0);
                const extraTracks = [];
                for (let i = currentMaxDose + 1; i <= med.times_per_day; i++) {
                    extraTracks.push({
                        user_id: userId,
                        medicine_id: med._id,
                        date: date,
                        dose_number: i,
                        status: 'Pending'
                    });
                }
                if (extraTracks.length > 0) {
                    await Tracking.insertMany(extraTracks);
                }
            }
        }

        // 3. Automated "Missed" Status Logic
        const now = new Date();
        const istNow = new Date(now.getTime() + (5.5 * 60 * 60 * 1000)); // Adjust for IST if needed, but let's stick to system time for now
        const currentYear = now.getFullYear();
        const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
        const currentDay = String(now.getDate()).padStart(2, '0');
        const systemDateStr = `${currentYear}-${currentMonth}-${currentDay}`;

        // Only check for "missed" if we are looking at today or a past date
        if (date <= systemDateStr) {
            const currentTracks = await Tracking.find({ user_id: userId, date: date, status: 'Pending' }).populate('medicine_id');
            
            for (const track of currentTracks) {
                const med = track.medicine_id;
                if (!med || !med.dose_times || !med.dose_times[track.dose_number - 1]) continue;

                const scheduledTimeStr = med.dose_times[track.dose_number - 1];
                const [schedH, schedM] = scheduledTimeStr.split(':').map(Number);
                
                const doseTime = new Date(now);
                doseTime.setHours(schedH, schedM, 0, 0);

                // For past dates, if it's pending, it's definitely missed
                // For today, check if it's more than 1 hour past
                const oneHourInMs = 60 * 60 * 1000;
                
                if (date < systemDateStr || (now.getTime() - doseTime.getTime()) > oneHourInMs) {
                    track.status = 'Missed';
                    await track.save();
                    console.log(`[Tracking] Dose ${track.dose_number} for ${med.medicine_name} marked as Missed (Scheduled: ${scheduledTimeStr})`);
                }
            }
        }

        // 4. Return all tracking records for this date, populated with medicine info
        const trackingData = await Tracking.find({ user_id: userId, date: date })
            .populate('medicine_id')
            .lean();

        return trackingData.map(track => {
            const med = track.medicine_id;
            return {
                track_id: track._id.toString(),
                medicine_id: med ? med._id.toString() : null,
                date: track.date,
                dose_number: track.dose_number,
                status: track.status,
                medicine_name: med ? med.medicine_name : 'Unknown',
                meal_option: med ? med.meal_option : 'Unknown',
                times_per_day: med ? med.times_per_day : 0,
                dose_times: med ? (med.dose_times || []) : []
            };
        });
    },

    updateTrackingStatus: async (trackId, userId, status) => {
        const updatedTrack = await Tracking.findOneAndUpdate(
            { _id: trackId, user_id: userId }, 
            { status: status }, 
            { new: true }
        ).populate('medicine_id');
        
        if (!updatedTrack) return null;

        const med = updatedTrack.medicine_id;
        return {
            track_id: updatedTrack._id.toString(),
            medicine_id: med ? med._id.toString() : null,
            date: updatedTrack.date,
            dose_number: updatedTrack.dose_number,
            status: updatedTrack.status,
            medicine_name: med ? med.medicine_name : 'Unknown'
        };
    }
};

module.exports = trackingModel;
