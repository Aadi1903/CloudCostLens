import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import ServiceCard from '../components/ServiceCard';
import FeedbackModal from '../components/FeedbackModal';
import ReasoningSection from '../components/ReasoningSection';
import ArchitectureDiagram from '../components/ArchitectureDiagram';
import AssumptionsSection from '../components/AssumptionsSection';
import { jsPDF } from 'jspdf';
import { createPlanPreview, startDeployment } from '../api/deployApi';

// AWS Theme Colors
const CHART_COLORS = ['#FF9900', '#0073BB', '#1D8102', '#D13212', '#8C4DFE', '#E58A00', '#005A93'];

const RecommendationPage = () => {
  const navigate = useNavigate();
  const [recommendation, setRecommendation]   = useState(null);
  const [requirements, setRequirements]       = useState(null);
  const [selectedArchitecture, setSelectedArchitecture] = useState(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [planLoading, setPlanLoading]         = useState(false);
  const [planOutput, setPlanOutput]           = useState('');
  const [planError, setPlanError]             = useState('');
  const [deployLoading, setDeployLoading]     = useState(false);
  const [deployError, setDeployError]         = useState('');
  const [moduleInfo, setModuleInfo]           = useState(null);
  const { isAdmin, user }                      = useAuth();
  const [showRestrictedMsg, setShowRestrictedMsg] = useState(false);

  useEffect(() => {
    const storedRec = sessionStorage.getItem('recommendation');
    const storedReq = sessionStorage.getItem('requirements');
    if (!storedRec || !storedReq) { navigate('/requirements'); return; }

    const rec = JSON.parse(storedRec);
    const req = JSON.parse(storedReq);
    setRecommendation(rec);
    setRequirements(req);
    setSelectedArchitecture({
      name: 'AWS Cloud Architecture',
      services: rec.architecture,
      totalCost: rec.totalCost,
      optionalUpgrades: rec.optionalUpgrades || [],
      isRecommended: true,
    });

    const moduleMap = {
      'static-website': 'storage_app',
      'file-storage':   'storage_app',
      'backend-api':    'web_app',
      'full-stack':     'web_app',
      'event-driven':   'scalable_app',
    };
    const moduleType = moduleMap[req.applicationType] || 'web_app';
    const instanceMap = { low: 't3.micro', medium: 't3.small', high: 't3.medium' };
    setModuleInfo({ moduleType, instanceType: instanceMap[req.traffic] || 't3.micro' });
  }, [navigate]);

  const handleGeneratePlan = async () => {
    setPlanLoading(true);
    setPlanError('');
    setPlanOutput('');
    try {
      const res = await createPlanPreview(requirements);
      setPlanOutput(res.planOutput || 'Plan generated successfully.');
      if (res.moduleType) setModuleInfo(prev => ({ ...prev, moduleType: res.moduleType }));
    } catch (e) {
      setPlanError(e.message);
    } finally {
      setPlanLoading(false);
    }
  };

  const handleDeploy = async () => {
    if (!isAdmin()) {
      setShowRestrictedMsg(true);
      return;
    }
    setDeployLoading(true);
    setDeployError('');
    try {
      const res = await startDeployment(requirements, recommendation);
      navigate('/deploy', { state: { deploymentId: res.deploymentId, requirements, recommendation } });
    } catch (e) {
      setDeployError('Failed to start deployment: ' + (e.message || 'Unknown error'));
      setDeployLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!selectedArchitecture) return;
    const doc = new jsPDF();
    doc.setFontSize(20); doc.setFont(undefined, 'bold');
    doc.text('CloudCostLens Report', 20, 20);
    doc.setFontSize(10); doc.setFont(undefined, 'normal');
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 28);
    doc.line(20, 32, 190, 32);
    let y = 40;
    doc.setFontSize(12); doc.setFont(undefined, 'bold');
    doc.text(`Architecture: ${selectedArchitecture.name}`, 20, y); y += 12;
    doc.text('Requirements:', 20, y); y += 8;
    doc.setFont(undefined, 'normal');
    doc.text(`App Type: ${requirements.applicationType}`, 25, y); y += 6;
    doc.text(`Traffic: ${requirements.traffic}`, 25, y); y += 6;
    doc.text(`Region: ${requirements.awsRegion || 'us-east-1'}`, 25, y); y += 6;
    doc.text(`Storage: ${requirements.storageGB} GB`, 25, y); y += 6;
    doc.text(`Budget: $${requirements.monthlyBudget}`, 25, y); y += 10;
    doc.setFont(undefined, 'bold'); doc.text('Service Breakdown:', 20, y); y += 8;
    doc.setFont(undefined, 'normal');
    selectedArchitecture.services.forEach(s => {
      doc.text(`${s.service} — $${s.estimatedCost.toFixed(2)}/mo (≈ ₹${(s.estimatedCost * 84).toFixed(0)})`, 25, y); y += 6;
    });
    y += 4; doc.line(20, y, 190, y); y += 6;
    doc.setFontSize(14); doc.setFont(undefined, 'bold');
    doc.text(`Total: $${selectedArchitecture.totalCost.toFixed(2)}/mo (≈ ₹${(selectedArchitecture.totalCost * 84).toFixed(0)})`, 20, y);
    doc.save('cloudcostlens-report.pdf');
  };

  const colorizeplan = (line) => {
    if (line.startsWith('+')) return 'plan-add';
    if (line.startsWith('-')) return 'plan-remove';
    if (line.startsWith('~')) return 'plan-change';
    return '';
  };

  if (!recommendation || !requirements) return null;

  const chartData = selectedArchitecture?.services.map(s => ({
    name: s.service,
    value: parseFloat(s.estimatedCost.toFixed(2)),
  })) || [];

  return (
    <div className="section">
      <div className="container">
        {/* Page header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div className="hero-badge" style={{ marginBottom: '0.75rem' }}>Architecture Ready</div>
            <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>System Infrastructure Design</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 0 }}>
              {requirements.applicationType} · {requirements.awsRegion || 'us-east-1'} · {requirements.traffic} traffic
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/requirements')} className="btn btn-ghost btn-sm">← Reconfigure</button>
          </div>
        </div>

        {/* Budget banner */}
        {recommendation.message && (
          <div className={`alert ${recommendation.withinBudget ? 'alert-success' : 'alert-error'} mb-4`}>
            <span>{recommendation.withinBudget ? '✅' : '⚠️'}</span>
            <span>{recommendation.message}</span>
          </div>
        )}

        {/* ===== Unified Dashboard Layout ===== */}
        <div className="grid" style={{ gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '2rem', alignItems: 'start' }}>
          
          {/* LEFT COLUMN: Data and Analysis */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* Architecture Card */}
            <div className="card">
              <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Network Architecture</h2>
              <ArchitectureDiagram selectedArchitecture={selectedArchitecture} />
              <div style={{ marginTop: '2rem' }}>
                <ReasoningSection selectedArchitecture={selectedArchitecture} requirements={requirements} />
              </div>
            </div>

            {/* Cost Analysis Card */}
            <div className="card">
              <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Cost Distribution</h2>
              <div className="grid grid-2" style={{ gap: '2rem', alignItems: 'start' }}>
                <div style={{ height: '300px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        label={false}
                      >
                        {chartData.map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(val) => [`$${val.toFixed(2)}/mo`, 'Cost']}
                        contentStyle={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-primary)' }}
                      />
                      <Legend verticalAlign="bottom" align="center" />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {recommendation.architecture.map((service, i) => (
                    <ServiceCard key={i}
                      service={service.service}
                      category={service.category}
                      reason={service.reason}
                      cost={service.estimatedCost}
                    />
                  ))}
                  <div style={{ marginTop: '0.5rem' }}><AssumptionsSection /></div>
                </div>
              </div>
            </div>

            {/* Terraform Execution Plan Card */}
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Terraform Execution Plan</h2>
                <button className="btn btn-outline btn-sm" onClick={handleGeneratePlan} disabled={planLoading}>
                  {planLoading ? 'Analyzing Workspace...' : 'Generate Plan Preview'}
                </button>
              </div>
              
              {planError && (
                <div className="alert alert-error" style={{ fontSize: '0.875rem' }}>
                  ❌ {planError}
                </div>
              )}

              {planOutput ? (
                <div className="plan-viewer" style={{ marginTop: '1rem' }}>
                  {planOutput.split('\n').map((line, i) => (
                    <span key={i} className={colorizeplan(line)} style={{ display: 'block' }}>
                      {line || '\u00A0'}
                    </span>
                  ))}
                </div>
              ) : (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                  {planLoading ? 'Generating infrastructure dependency graph...' : 'Click to preview the raw infrastructure changes.'}
                </div>
              )}
            </div>

          </div>

          {/* RIGHT COLUMN: Sticky Control Panel */}
          <div style={{ position: 'sticky', top: '100px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            <div className="card" style={{ borderTop: '3px solid var(--primary)', padding: '2rem 1.5rem' }}>
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <p style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                  Total Estimated Cost
                </p>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: recommendation.withinBudget ? 'var(--success)' : 'var(--error)' }}>
                  ${recommendation.totalCost.toFixed(2)}<span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 400 }}>/mo</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  ≈ ₹{(recommendation.totalCost * 84).toFixed(0)} / mo
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  Budget: ${recommendation.budget?.toFixed(2)}/mo (≈ ₹{((recommendation.budget || 0) * 84).toFixed(0)})
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <button
                  className="btn btn-deploy w-full"
                  onClick={handleDeploy}
                  disabled={deployLoading}
                  style={{ padding: '1rem' }}
                >
                  {deployLoading ? 'Initiating Pipeline...' : 'Deploy Infrastructure'}
                </button>

                {deployError && (
                  <div className="alert alert-error" style={{ fontSize: '0.8rem', padding: '0.75rem' }}>
                    {deployError}
                  </div>
                )}

                {showRestrictedMsg && (
                  <div className="alert alert-warning" style={{ fontSize: '0.85rem', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid rgba(var(--accent-rgb), 0.3)' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>👉 Admin Access Required</div>
                    Deployment is restricted to authorized admin users to ensure cost and security control.
                    <div style={{ marginTop: '0.5rem' }}>
                      <Link to="/login" style={{ color: 'var(--accent-primary)', textDecoration: 'underline' }}>Login as Admin</Link>
                    </div>
                  </div>
                )}
                
                <hr style={{ border: 0, borderTop: '1px solid var(--border)', margin: '0.5rem 0' }} />

                <button onClick={handleDownloadPDF} className="btn btn-ghost w-full">
                  📄 Download PDF Report
                </button>
                <button onClick={() => setShowFeedbackModal(true)} className="btn btn-outline w-full">
                  Submit Feedback
                </button>
              </div>
            </div>

            {/* Meta Information */}
            {moduleInfo && (
              <div className="card" style={{ padding: '1.25rem' }}>
                <h4 style={{ fontSize: '0.875rem', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>Runtime Configuration</h4>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>
                  module.{moduleInfo.moduleType}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Instance Profile: <strong>{moduleInfo.instanceType}</strong>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                  Target Region: <strong>{requirements.awsRegion || 'us-east-1'}</strong>
                </div>
              </div>
            )}

          </div>

        </div>
      </div>
      
      {showFeedbackModal && (
        <FeedbackModal 
          onClose={() => setShowFeedbackModal(false)}
          requirements={requirements}
          recommendation={recommendation}
        />
      )}
    </div>
  );
};

export default RecommendationPage;
