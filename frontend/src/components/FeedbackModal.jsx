import React, { useState } from 'react';

const FeedbackModal = ({ onClose }) => {
    const [formData, setFormData] = useState({
        name: '', email: '', message: '', type: 'feature-request'
    });
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (res.ok) setSubmitted(true);
        } catch (err) {
            console.error(err);
        }
    };

    const modalStyle = {
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
    };
    const contentStyle = {
        backgroundColor: 'var(--bg-primary)', padding: '2rem', borderRadius: 'var(--radius-lg)', maxWidth: '500px', width: '90%'
    };

    return (
        <div style={modalStyle}>
            <div style={contentStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <h2>Feedback</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
                </div>

                {submitted ? (
                    <div className="text-center">
                        <h3 className="text-success mb-2">Thank You!</h3>
                        <p>Your feedback helps us improve CloudCostLens.</p>
                        <button onClick={onClose} className="btn btn-primary mt-4">Close</button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Type</label>
                            <select className="form-select" value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                                <option value="feature-request">Feature Request</option>
                                <option value="wrong-recommendation">Wrong Recommendation</option>
                                <option value="missing-use-case">Missing Use Case</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Name (Optional)</label>
                            <input className="form-input" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Email (Optional)</label>
                            <input className="form-input" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Message</label>
                            <textarea className="form-input" rows="4" required value={formData.message} onChange={e => setFormData({ ...formData, message: e.target.value })} />
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Submit Feedback</button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default FeedbackModal;
