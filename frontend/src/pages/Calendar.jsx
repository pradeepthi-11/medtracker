import { useState, useEffect } from 'react';
import { trackingApi } from '../api';
import { ChevronLeft, ChevronRight, Check, X, Clock } from 'lucide-react';
import './Calendar.css';

const formatDoseTime = (doseTimesStr, doseNum) => {
    try {
        if (!doseTimesStr) return `Dose ${doseNum}`;
        const times = JSON.parse(doseTimesStr);
        if (times && times.length >= doseNum) {
            const [hourStr, minStr] = times[doseNum - 1].split(':');
            let hour = parseInt(hourStr, 10);
            const ampm = hour >= 12 ? 'PM' : 'AM';
            hour = hour % 12 || 12;
            return `${hour}:${minStr || '00'} ${ampm}`;
        }
    } catch (e) {}
    return `Dose ${doseNum}`;
};

const Calendar = () => {
    // Determine the local date correctly to avoid UTC shifts
    const today = new Date();
    const offset = today.getTimezoneOffset();
    const localTodayStr = new Date(today.getTime() - (offset*60*1000)).toISOString().split('T')[0];

    const [selectedDate, setSelectedDate] = useState(localTodayStr);
    const [currentMonthDate, setCurrentMonthDate] = useState(new Date(today.getTime() - (offset*60*1000)));

    const [doses, setDoses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDailyTracking(selectedDate);
    }, [selectedDate]);

    const fetchDailyTracking = async (dateStr) => {
        setLoading(true);
        try {
            const res = await trackingApi.getDaily(dateStr);
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
            setDoses(doses.map(d => d.track_id === trackId ? { ...d, status: newStatus } : d));
            await trackingApi.updateStatus(trackId, newStatus);
        } catch (error) {
            console.error('Failed to update status', error);
            fetchDailyTracking(selectedDate);
        }
    };

    const changeMonth = (offset) => {
        const newDate = new Date(currentMonthDate);
        newDate.setMonth(newDate.getMonth() + offset);
        setCurrentMonthDate(newDate);
    };

    const year = currentMonthDate.getFullYear();
    const month = currentMonthDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    
    // Generate empty padding for the grid
    const cells = Array.from({ length: firstDay }).map((_, i) => (
        <div key={`empty-${i}`} className="cal-cell empty"></div>
    ));

    // Generate days
    for (let day = 1; day <= daysInMonth; day++) {
        const cellDate = new Date(year, month, day);
        // adjust local format
        const offsetLocal = cellDate.getTimezoneOffset();
        const localCellStr = new Date(cellDate.getTime() - (offsetLocal*60*1000)).toISOString().split('T')[0];

        const isSelected = selectedDate === localCellStr;
        const isToday = localTodayStr === localCellStr;

        cells.push(
            <div 
               key={`day-${day}`} 
               className={`cal-cell ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}`}
               onClick={() => setSelectedDate(localCellStr)}
            >
                {day}
            </div>
        );
    }

    const formattedSelectDate = new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

    return (
        <div className="calendar-page-container fade-in">
            <div className="calendar-top">
                <div className="calendar-widget">
                    <div className="cal-header">
                        <button className="cal-nav-btn" onClick={() => changeMonth(-1)}>
                            <ChevronLeft size={18} />
                        </button>
                        <h3>{monthNames[month]} {year}</h3>
                        <button className="cal-nav-btn" onClick={() => changeMonth(1)}>
                            <ChevronRight size={18} />
                        </button>
                    </div>
                    <div className="cal-weekdays">
                        <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
                    </div>
                    <div className="cal-grid">
                        {cells}
                    </div>
                </div>

                <div className="day-details">
                    <div className="day-header">
                        <h2 className="date-large">{selectedDate === localTodayStr ? "Today" : formattedSelectDate}</h2>
                        <p className="dose-summary">
                            {doses.length === 0 ? "No medicines scheduled." : `${doses.filter(d => d.status === 'Taken').length} of ${doses.length} doses taken`}
                        </p>
                    </div>

                    <div className="doses-section">
                        {loading ? (
                            <div className="loading-state">Loading doses...</div>
                        ) : doses.length === 0 ? (
                            <div className="card empty-state">
                                <p>You have no scheduled doses for this day.</p>
                            </div>
                        ) : (
                            <div className="doses-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
                                {doses.map(dose => (
                                    <div key={dose.track_id} className={`card dose-card ${dose.status.toLowerCase()}`}>
                                        <div className="dose-header">
                                            <h4 className="medicine-name">{dose.medicine_name}</h4>
                                            <span className={`badge badge-${dose.status.toLowerCase()}`}>{dose.status}</span>
                                        </div>
                                        <div className="dose-details">
                                            <p className="dose-number">
                                                {formatDoseTime(dose.dose_times, dose.dose_number)}
                                                <span className="opacity-60 ml-2 text-sm">
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
            </div>
        </div>
    );
};

export default Calendar;
