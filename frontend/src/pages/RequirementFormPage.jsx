import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRecommendation } from '../api/recommendationApi';
import HelpMeDecideModal from '../components/HelpMeDecideModal';

const AWS_REGIONS = [
  { value: 'us-east-1',      label: 'US East (N. Virginia)' },
  { value: 'us-east-2',      label: 'US East (Ohio)' },
  { value: 'us-west-1',      label: 'US West (N. California)' },
  { value: 'us-west-2',      label: 'US West (Oregon)' },
  { value: 'eu-west-1',      label: 'Europe (Ireland)' },
  { value: 'eu-west-2',      label: 'Europe (London)' },
  { value: 'eu-central-1',   label: 'Europe (Frankfurt)' },
  { value: 'ap-south-1',     label: 'Asia Pacific (Mumbai)' },
  { value: 'ap-southeast-1', label: 'Asia Pacific (Singapore)' },
  { value: 'ap-southeast-2', label: 'Asia Pacific (Sydney)' },
  { value: 'ap-northeast-1', label: 'Asia Pacific (Tokyo)' },
];

const RequirementFormPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');
  const [showHelpModal, setShowHelpModal] = useState(false);

  const [formData, setFormData] = useState({
    applicationType:  'backend-api',
    traffic:          'medium',
    storageGB:        100,
    databaseNeeded:   true,
    operationalEffort:'low',
    monthlyBudget:    100,
    awsRegion:        'us-east-1',
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked
            : (name === 'storageGB' || name === 'monthlyBudget') ? Number(value)
            : value
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
      <div className="container" style={{ maxWidth: '820px' }}>
        <div className="text-center mb-4">
          <div className="hero-badge" style={{ marginBottom: '1rem' }}>
            Infrastructure Parameters
          </div>
          <h1>Define Your Requirements</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.0625rem', marginTop: '0.75rem' }}>
            Specify your technical application details to generate a validated AWS architecture and Terraform configuration.
          </p>
        </div>

        <div className="card" style={{ padding: '2.5rem' }}>
          <form onSubmit={handleSubmit}>

            {/* Application Type */}
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>1. Application Type</span>
                <button type="button" onClick={() => setShowHelpModal(true)}
                  style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 }}>
                  Help me decide
                </button>
              </label>
              <select name="applicationType" value={formData.applicationType} onChange={handleChange} className="form-select" required>
                <option value="static-website">Static Website</option>
                <option value="backend-api">Backend API</option>
                <option value="full-stack">Full-Stack Web Application</option>
                <option value="file-storage">File Storage System</option>
                <option value="event-driven">Event-Driven Application</option>
              </select>
              <p className="form-hint">This determines which Terraform module will be used for deployment.</p>
            </div>

            {/* AWS Region */}
            <div className="form-group">
              <label className="form-label">2. AWS Region</label>
              <select name="awsRegion" value={formData.awsRegion} onChange={handleChange} className="form-select" required>
                {AWS_REGIONS.map(r => (
                  <option key={r.value} value={r.value}>{r.label} ({r.value})</option>
                ))}
              </select>
              <p className="form-hint">Select the AWS region where your infrastructure will be deployed.</p>
            </div>

            {/* Traffic */}
            <div className="form-group">
              <label className="form-label">3. Expected Traffic</label>
              <div className="radio-card-group">
                {[
                  { value: 'low',    label: 'Low',    desc: '< 10k req/month',     instance: 't3.micro' },
                  { value: 'medium', label: 'Medium', desc: '10k–100k req/month',   instance: 't3.small' },
                  { value: 'high',   label: 'High',   desc: '> 100k req/month',     instance: 't3.medium' },
                ].map(opt => (
                  <label key={opt.value} className={`radio-card ${formData.traffic === opt.value ? 'selected' : ''}`}>
                    <input type="radio" name="traffic" value={opt.value} checked={formData.traffic === opt.value} onChange={handleChange} />
                    <div>
                      <div style={{ fontWeight: 700 }}>{opt.label}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{opt.desc}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--primary)', marginTop: '0.2rem' }}>{opt.instance}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Storage */}
            <div className="form-group">
              <label className="form-label">4. Storage Required: <strong style={{ color: 'var(--primary)' }}>{formData.storageGB} GB</strong></label>
              <input type="range" name="storageGB" min="0" max="2000" step="50"
                value={formData.storageGB} onChange={handleChange} />
              <div className="flex justify-between" style={{ marginTop: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>0 GB</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>1000 GB</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>2000 GB</span>
              </div>
            </div>

            {/* Database */}
            <div className="form-group">
              <label style={{
                display: 'flex', alignItems: 'center', gap: '1rem',
                padding: '1.125rem',
                border: `1.5px solid ${formData.databaseNeeded ? 'var(--primary)' : 'var(--border)'}`,
                borderRadius: 'var(--radius-lg)', cursor: 'pointer',
                transition: 'var(--transition)',
                background: formData.databaseNeeded ? 'var(--primary-glow)' : 'var(--bg-glass)',
              }}>
                <input type="checkbox" name="databaseNeeded" checked={formData.databaseNeeded} onChange={handleChange} style={{ width: '20px', height: '20px' }} />
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>5. Database Required</div>
                  <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    Check if your application needs a persistent database (RDS will be recommended)
                  </div>
                </div>
              </label>
            </div>

            {/* Operational Effort */}
            <div className="form-group">
              <label className="form-label">6. Operational Preference</label>
              <div className="radio-card-group">
                {[
                  { value: 'low',    label: 'Low',    desc: 'Fully managed services' },
                  { value: 'medium', label: 'Medium', desc: 'Balanced control' },
                  { value: 'high',   label: 'High',   desc: 'Maximum control' },
                ].map(opt => (
                  <label key={opt.value} className={`radio-card ${formData.operationalEffort === opt.value ? 'selected' : ''}`}>
                    <input type="radio" name="operationalEffort" value={opt.value} checked={formData.operationalEffort === opt.value} onChange={handleChange} />
                    <div>
                      <div style={{ fontWeight: 700 }}>{opt.label}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{opt.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Budget */}
            <div className="form-group">
              <label className="form-label">Monthly Budget (USD)</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontWeight: 600 }}>$</span>
                <input type="number" name="monthlyBudget" min="1" step="1"
                  value={formData.monthlyBudget} onChange={handleChange}
                  className="form-input" required
                  style={{ paddingLeft: '2rem' }} />
              </div>
              <p className="form-hint">≈ ₹{(formData.monthlyBudget * 84).toLocaleString()} INR · Recommendations will stay within this limit</p>
            </div>

            {/* Error */}
            {error && (
              <div className="alert alert-error">
                <span>⚠️</span> {error}
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-large w-full" disabled={loading}>
              {loading ? (
                <><span className="spin">/</span> Analyzing Requirements...</>
              ) : (
                <>Generate Recommendations</>
              )}
            </button>
          </form>
        </div>
      </div>

      {showHelpModal && (
        <HelpMeDecideModal onClose={() => setShowHelpModal(false)} onComplete={handleHelpDecide} />
      )}
    </div>
  );
};

export default RequirementFormPage;
