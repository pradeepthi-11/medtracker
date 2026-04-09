import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { medicineApi } from '../api';
import { Edit2, Trash2, Calendar, Clock } from 'lucide-react';
import './Medicines.css';

const Medicines = () => {
    const [medicines, setMedicines] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchMedicines();
    }, []);

    const fetchMedicines = async () => {
        try {
            const res = await medicineApi.getAll();
            if (res.data && res.data.success) {
                setMedicines(res.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch medicines', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this medicine? All tracking history will also be deleted.')) {
            try {
                await medicineApi.delete(id);
                setMedicines(medicines.filter(m => m.medicine_id !== id));
            } catch (error) {
                console.error('Failed to delete medicine', error);
            }
        }
    };

    if (loading) return <div className="loading-state">Loading medicines...</div>;

    return (
        <div className="medicines-container">
            <div className="medicines-header">
                <h2>My Active Medicines</h2>
            </div>

            {medicines.length === 0 ? (
                <div className="card empty-state">
                    <p>No medicines found in your list.</p>
                </div>
            ) : (
                <div className="medicines-grid">
                    {medicines.map((med) => (
                        <div key={med.medicine_id} className="card med-card">
                            <div className="med-header">
                                <h3 className="med-title">{med.medicine_name}</h3>
                            </div>
                            <div className="med-body">
                                <div className="med-info-row">
                                     <Clock size={16} />
                                     <span>{med.times_per_day} times a day</span>
                                </div>
                                <div className="med-info-row">
                                     <span className="bullet">•</span>
                                     <span>{med.meal_option}</span>
                                </div>
                                <div className="med-info-row dates">
                                     <Calendar size={16} />
                                     <span>Start: {med.start_date}</span>
                                     {med.end_date && <span>  End: {med.end_date}</span>}
                                </div>
                            </div>
                            <div className="med-actions">
                                <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/edit/${med.medicine_id}`)}>
                                    <Edit2 size={16} /> Edit
                                </button>
                                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(med.medicine_id)}>
                                    <Trash2 size={16} /> Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Medicines;
