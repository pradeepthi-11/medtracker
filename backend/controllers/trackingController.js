const trackingModel = require('../models/trackingModel');

const trackingController = {
    getDailyTracking: async (req, res) => {
        try {
            const { date } = req.params;
            const trackingData = await trackingModel.getDailyTracking(req.user.id, date);
            res.json({ success: true, count: trackingData.length, data: trackingData });
        } catch (error) {
            console.error('Error fetching daily tracking:', error);
            res.status(500).json({ success: false, message: 'Server Error' });
        }
    },

    updateTrackingStatus: async (req, res) => {
        try {
            const { id } = req.params;
            const { status } = req.body;
            
            if (!['Pending', 'Taken', 'Missed'].includes(status)) {
                return res.status(400).json({ success: false, message: 'Invalid status' });
            }

            const updatedTrack = await trackingModel.updateTrackingStatus(id, req.user.id, status);
            res.json({ success: true, data: updatedTrack });
        } catch (error) {
            console.error('Error updating tracking status:', error);
            res.status(500).json({ success: false, message: 'Server Error' });
        }
    }
};

module.exports = trackingController;
