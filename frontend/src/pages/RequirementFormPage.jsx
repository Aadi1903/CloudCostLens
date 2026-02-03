import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRecommendation } from '../api/recommendationApi';

import HelpMeDecideModal from '../components/HelpMeDecideModal';

const RequirementFormPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showHelpModal, setShowHelpModal] = useState(false);

    const [formData, setFormData] = useState({
        applicationType: 'backend-api',
        traffic: 'medium',
        storageGB: 100,
        databaseNeeded: true,
        operationalEffort: 'low',
        monthlyBudget: 100
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked :
                (name === 'storageGB' || name === 'monthlyBudget') ? Number(value) : value
        }));
    };

    const handleHelpDecide = (type) => {
        setFormData(prev => ({ ...prev, applicationType: type }));
        setShowHelpModal(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const recommendation = await getRecommendation(formData);
            // Store recommendation in sessionStorage to access in RecommendationPage
            sessionStorage.setItem('recommendation', JSON.stringify(recommendation));
            sessionStorage.setItem('requirements', JSON.stringify(formData));
            navigate('/recommendation');
        } catch (err) {
            setError(err.message || 'Failed to get recommendation. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="section">
            <div className="container" style={{ maxWidth: '800px' }}>
                <div className="text-center mb-4">
                    <h1>Tell Us About Your Application</h1>
                    <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)' }}>
                        Answer a few questions to get personalized AWS service recommendations
                    </p>
                </div>

                <div className="card" style={{ padding: '2rem' }}>
                    <form onSubmit={handleSubmit}>
                        {/* Application Type */}
                        <div className="form-group">
                            <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                                Application Type
                                <button
                                    type="button"
                                    onClick={() => setShowHelpModal(true)}
                                    style={{
                                        background: 'none', border: 'none', color: 'var(--primary)',
                                        cursor: 'pointer', textDecoration: 'underline', fontSize: '0.9rem'
                                    }}
                                >
                                    Not sure? Help me decide
                                </button>
                            </label>
                            <select
                                name="applicationType"
                                value={formData.applicationType}
                                onChange={handleChange}
                                className="form-select"
                                required
                            >
                                <option value="static-website">Static Website</option>
                                <option value="backend-api">Backend API</option>
                                <option value="full-stack">Full-Stack Web Application</option>
                                <option value="file-storage">File Storage System</option>
                                <option value="event-driven">Event-Driven Application</option>
                            </select>
                        </div>

                        {/* Expected Traffic */}
                        <div className="form-group">
                            <label className="form-label">Expected Traffic</label>
                            <div className="form-radio-group">
                                {['low', 'medium', 'high'].map(level => (
                                    <label key={level} style={{
                                        flex: 1,
                                        minWidth: '150px',
                                        padding: '1rem',
                                        border: `2px solid ${formData.traffic === level ? 'var(--primary)' : 'var(--border)'}`,
                                        borderRadius: 'var(--radius-md)',
                                        cursor: 'pointer',
                                        transition: 'var(--transition)',
                                        backgroundColor: formData.traffic === level ? 'rgba(255, 107, 53, 0.05)' : 'transparent'
                                    }}>
                                        <input
                                            type="radio"
                                            name="traffic"
                                            value={level}
                                            checked={formData.traffic === level}
                                            onChange={handleChange}
                                            style={{ marginRight: '0.5rem' }}
                                        />
                                        <strong style={{ textTransform: 'capitalize' }}>{level}</strong>
                                        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                                            {level === 'low' && '< 10k req/month'}
                                            {level === 'medium' && '10k-100k req/month'}
                                            {level === 'high' && '> 100k req/month'}
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Storage Required */}
                        <div className="form-group">
                            <label className="form-label">
                                Storage Required: {formData.storageGB} GB
                            </label>
                            <input
                                type="range"
                                name="storageGB"
                                min="0"
                                max="2000"
                                step="50"
                                value={formData.storageGB}
                                onChange={handleChange}
                                style={{ width: '100%' }}
                            />
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                fontSize: '0.875rem',
                                color: 'var(--text-muted)',
                                marginTop: '0.5rem'
                            }}>
                                <span>0 GB</span>
                                <span>1000 GB</span>
                                <span>2000 GB</span>
                            </div>
                        </div>

                        {/* Database Needed */}
                        <div className="form-group">
                            <label style={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: '1rem',
                                border: '1px solid var(--border)',
                                borderRadius: 'var(--radius-md)',
                                cursor: 'pointer'
                            }}>
                                <input
                                    type="checkbox"
                                    name="databaseNeeded"
                                    checked={formData.databaseNeeded}
                                    onChange={handleChange}
                                    style={{ marginRight: '0.75rem', width: '20px', height: '20px' }}
                                />
                                <div>
                                    <div className="form-label" style={{ marginBottom: '0.25rem' }}>
                                        Database Required
                                    </div>
                                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                        Check if your application needs a database
                                    </div>
                                </div>
                            </label>
                        </div>

                        {/* Operational Preference */}
                        <div className="form-group">
                            <label className="form-label">Operational Preference</label>
                            <div className="form-radio-group">
                                {[
                                    { value: 'low', label: 'Low Maintenance', desc: 'Fully managed services' },
                                    { value: 'medium', label: 'Medium Maintenance', desc: 'Balanced control' },
                                    { value: 'high', label: 'High Maintenance', desc: 'Maximum control' }
                                ].map(option => (
                                    <label key={option.value} style={{
                                        flex: 1,
                                        minWidth: '150px',
                                        padding: '1rem',
                                        border: `2px solid ${formData.operationalEffort === option.value ? 'var(--primary)' : 'var(--border)'}`,
                                        borderRadius: 'var(--radius-md)',
                                        cursor: 'pointer',
                                        transition: 'var(--transition)',
                                        backgroundColor: formData.operationalEffort === option.value ? 'rgba(255, 107, 53, 0.05)' : 'transparent'
                                    }}>
                                        <input
                                            type="radio"
                                            name="operationalEffort"
                                            value={option.value}
                                            checked={formData.operationalEffort === option.value}
                                            onChange={handleChange}
                                            style={{ marginRight: '0.5rem' }}
                                        />
                                        <strong>{option.label}</strong>
                                        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                                            {option.desc}
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Monthly Budget */}
                        <div className="form-group">
                            <label className="form-label">
                                Monthly Budget (Max): ${formData.monthlyBudget}
                            </label>
                            <input
                                type="number"
                                name="monthlyBudget"
                                min="1"
                                step="1"
                                value={formData.monthlyBudget}
                                onChange={handleChange}
                                className="form-input"
                                required
                            />
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                                Enter your maximum limit suitable for your needs.
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div style={{
                                padding: '1rem',
                                backgroundColor: 'rgba(245, 101, 101, 0.1)',
                                border: '1px solid var(--error)',
                                borderRadius: 'var(--radius-md)',
                                color: 'var(--error)',
                                marginBottom: '1rem'
                            }}>
                                {error}
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="btn btn-primary btn-large"
                            style={{ width: '100%' }}
                            disabled={loading}
                        >
                            {loading ? 'Getting Recommendations...' : 'Get Recommendations'}
                        </button>
                    </form>
                </div>
            </div>

            {showHelpModal && (
                <HelpMeDecideModal
                    onClose={() => setShowHelpModal(false)}
                    onComplete={handleHelpDecide}
                />
            )}
        </div>
    );
};

export default RequirementFormPage;
