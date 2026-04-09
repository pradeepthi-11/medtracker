import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { medicineApi } from '../api';
import './AddMedicine.css';

const AddMedicine = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = Boolean(id);

    const [formData, setFormData] = useState({
        medicine_name: '',
        times_per_day: 1,
        meal_option: 'After Meal',
        start_date: new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60 * 1000)).toISOString().split('T')[0],
        end_date: '',
        dose_times: ['08:00']
    });

    const [loading, setLoading] = useState(isEditMode);

    useEffect(() => {
        if (isEditMode) {
            fetchMedicineDetails();
        }
    }, [id]);

    const fetchMedicineDetails = async () => {
        try {
            const res = await medicineApi.getById(id);
            if (res.data && res.data.success) {
                let data = res.data.data;
                if (typeof data.dose_times === 'string') {
                    try { data.dose_times = JSON.parse(data.dose_times); } catch (e) { data.dose_times = []; }
                }
                if (!data.dose_times || !Array.isArray(data.dose_times) || data.dose_times.length === 0) {
                    data.dose_times = Array(data.times_per_day).fill('08:00');
                }
                setFormData(data);
            }
        } catch (error) {
            console.error('Failed to fetch medicine details', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'times_per_day') {
            const num = parseInt(value, 10);
            setFormData(prev => {
                const newDoseTimes = [...(prev.dose_times || [])];
                while(newDoseTimes.length < num) newDoseTimes.push('08:00');
                if (newDoseTimes.length > num) newDoseTimes.length = num;
                return { ...prev, times_per_day: num, dose_times: newDoseTimes };
            });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleTimeChange = (index, value) => {
        setFormData(prev => {
            const newTimes = [...prev.dose_times];
            newTimes[index] = value;
            return { ...prev, dose_times: newTimes };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditMode) {
                await medicineApi.update(id, formData);
            } else {
                await medicineApi.add(formData);
            }
            navigate('/medicines');
        } catch (error) {
            console.error('Failed to save medicine', error);
            alert('Failed to save medicine. Check console.');
        }
    };

    if (loading) return <div className="loading-state">Loading form...</div>;

    return (
        <div className="add-medicine-container">
             <div className="form-wrapper card">
                  <div className="form-header">
                       <h2>{isEditMode ? 'Edit Medicine' : 'Add New Medicine'}</h2>
                       <p className="subtitle">Fill in the schedule to automatically track doses.</p>
                  </div>
                  
                  <form onSubmit={handleSubmit} className="medicine-form">
                       <div className="form-group full-width">
                            <label>Medicine Name</label>
                            <input 
                                type="text" 
                                name="medicine_name"
                                value={formData.medicine_name}
                                onChange={handleChange}
                                placeholder="e.g. Paracetamol 500mg"
                                required 
                            />
                       </div>

                       <div className="form-row">
                           <div className="form-group">
                                <label>Times Per Day</label>
                                <select 
                                    name="times_per_day"
                                    value={formData.times_per_day}
                                    onChange={handleChange}
                                    required
                                >
                                    {[1, 2, 3, 4, 5, 6].map(num => (
                                        <option key={num} value={num}>{num} {num === 1 ? 'time' : 'times'}</option>
                                    ))}
                                </select>
                           </div>

                           <div className="form-group">
                                <label>Meal Option</label>
                                <select 
                                    name="meal_option"
                                    value={formData.meal_option}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="Before Meal">Before Meal</option>
                                    <option value="After Meal">After Meal</option>
                                    <option value="During Meals">During Meals</option>
                                </select>
                           </div>
                       </div>

                       <div className="form-row">
                           <div className="form-group">
                                <label>Start Date</label>
                                <input 
                                    type="date" 
                                    name="start_date"
                                    value={formData.start_date}
                                    onChange={handleChange}
                                    required 
                                />
                           </div>

                           <div className="form-group">
                                <label>End Date (Optional)</label>
                                <input 
                                    type="date" 
                                    name="end_date"
                                    value={formData.end_date || ''}
                                    onChange={handleChange}
                                />
                           </div>
                       </div>

                       <div className="form-group full-width">
                            <label>Dose Times</label>
                            <div className="dose-times-grid">
                                {formData.dose_times.map((time, index) => {
                                    const [hour, minute] = (time || '08:00').split(':');
                                    
                                    const handleHourChange = (e) => {
                                        const newTime = `${e.target.value}:${minute}`;
                                        handleTimeChange(index, newTime);
                                    };
                                    
                                    const handleMinuteChange = (e) => {
                                        const newTime = `${hour}:${e.target.value}`;
                                        handleTimeChange(index, newTime);
                                    };

                                    return (
                                        <div key={index} className="dose-time-card">
                                            <label>Dose {index + 1}</label>
                                            <div className="time-dropdown-wrapper">
                                                <select value={hour} onChange={handleHourChange} className="time-select">
                                                    {Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0')).map(h => (
                                                        <option key={h} value={h}>{h}</option>
                                                    ))}
                                                </select>
                                                <span className="time-separator text-tertiary">:</span>
                                                <select value={minute} onChange={handleMinuteChange} className="time-select">
                                                    {Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0')).map(m => (
                                                        <option key={m} value={m}>{m}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                       </div>

                       <div className="form-actions">
                           <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>Cancel</button>
                           <button type="submit" className="btn btn-primary">
                               {isEditMode ? 'Save Changes' : 'Add Medicine'}
                           </button>
                       </div>
                  </form>
             </div>
        </div>
    );
};

export default AddMedicine;
