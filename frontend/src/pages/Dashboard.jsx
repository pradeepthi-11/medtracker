import { useState, useEffect } from 'react';
import { trackingApi } from '../api';
import { Check, X, Clock } from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
    const [doses, setDoses] = useState([]);
    const [loading, setLoading] = useState(true);

    const today = new Date();
    const offset = today.getTimezoneOffset();
    const todayDate = new Date(today.getTime() - (offset * 60 * 1000)).toISOString().split('T')[0];
    const displayDate = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

    useEffect(() => {
        fetchDailyTracking();
    }, []);

    const fetchDailyTracking = async () => {
        try {
            const res = await trackingApi.getDaily(todayDate);
            if (res.data && res.data.success) {
                setDoses(res.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch tracking data', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (trackId, newStatus) => {
        try {
            // Optimistic Update
            setDoses(doses.map(d => d.track_id === trackId ? { ...d, status: newStatus } : d));
            await trackingApi.updateStatus(trackId, newStatus);
        } catch (error) {
            console.error('Failed to update status', error);
            // Revert on failure
            fetchDailyTracking();
        }
    };

    if (loading) return <div className="loading-state">Loading today's schedule...</div>;

    const takenCount = doses.filter(d => d.status === 'Taken').length;
    const progress = doses.length > 0 ? (takenCount / doses.length) * 100 : 0;

    const formatDoseTime = (doseTimesStr, doseNum) => {
        try {
            if (!doseTimesStr) return `Dose ${doseNum}`;
            const times = JSON.parse(doseTimesStr);
            if (times && times.length >= doseNum) {
                // Formatting time like "08:00" to "08:00 AM"
                const [hourStr, minStr] = times[doseNum - 1].split(':');
                let hour = parseInt(hourStr, 10);
                const ampm = hour >= 12 ? 'PM' : 'AM';
                hour = hour % 12 || 12;
                return `${hour}:${minStr || '00'} ${ampm}`;
            }
        } catch (e) {
            console.error('Time parsing error', e);
        }
        return `Dose ${doseNum}`;
    };

    return (
        <div className="dashboard-container">
            <div className="summary-cards">
                <div className="card stat-card">
                    <h3>Today's Summary</h3>
                    <p className="stat-date">{displayDate}</p>
                    <div className="stat-boxes">
                        <div className="stat-box">
                            <span className="stat-num">{doses.length}</span>
                            <span className="stat-label">Total Doses</span>
                        </div>
                        <div className="stat-box success">
                            <span className="stat-num">{takenCount}</span>
                            <span className="stat-label">Taken</span>
                        </div>
                    </div>
                </div>

                <div className="card stat-card progress-card">
                    <h3>Daily Progress</h3>
                    <div className="progress-bar-container">
                         <div className="progress-bar" style={{ width: `${progress}%` }}></div>
                    </div>
                    <p>{Math.round(progress)}% Completed</p>
                </div>
            </div>

            <div className="doses-section">
                <h2 className="section-title">Today's Medicines</h2>
                {doses.length === 0 ? (
                    <div className="card empty-state">
                        <p>No medicines scheduled for today.</p>
                    </div>
                ) : (
                    <div className="doses-grid">
                        {doses.map(dose => (
                            <div key={dose.track_id} className={`card dose-card ${dose.status.toLowerCase()}`}>
                                <div className="dose-header">
                                    <h4 className="medicine-name">{dose.medicine_name}</h4>
                                    <span className={`badge badge-${dose.status.toLowerCase()}`}>{dose.status}</span>
                                </div>
                                <div className="dose-details">
                                    <p className="dose-number">
                                        {formatDoseTime(dose.dose_times, dose.dose_number)}
                                        <span style={{opacity: 0.6, marginLeft: '6px', fontSize: '0.8em'}}>
                                            (Dose {dose.dose_number}/{dose.times_per_day})
                                        </span>
                                    </p>
                                    <p className="meal-option">{dose.meal_option}</p>
                                </div>
                                <div className="dose-actions">
                                    <button 
                                        className={`btn-action btn-check ${dose.status === 'Taken' ? 'active' : ''}`}
                                        title="Mark Taken"
                                        onClick={() => handleStatusUpdate(dose.track_id, 'Taken')}
                                    >
                                        <Check size={18} />
                                    </button>
                                    <button 
                                        className={`btn-action btn-cross ${dose.status === 'Missed' ? 'active' : ''}`}
                                        title="Mark Missed"
                                        onClick={() => handleStatusUpdate(dose.track_id, 'Missed')}
                                    >
                                        <X size={18} />
                                    </button>
                                    <button 
                                        className={`btn-action btn-pending ${dose.status === 'Pending' ? 'active' : ''}`}
                                        title="Reset"
                                        onClick={() => handleStatusUpdate(dose.track_id, 'Pending')}
                                    >
                                        <Clock size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
