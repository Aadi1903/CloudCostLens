import React, { useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { startDeployment, getDeploymentStatus, destroyDeployment, getDeploymentResources, stopDeployment } from '../api/deployApi';
import LogViewer from '../components/LogViewer';
import ResourceSummaryCard from '../components/ResourceSummaryCard';
import { useRef } from 'react';

const STEPS = [
  { key: 'PENDING',      label: 'Queued',           desc: 'Deployment request received',           icon: '...' },
  { key: 'INITIALIZING', label: 'Initializing',      desc: 'Setting up Terraform workspace',         icon: 'i' },
  { key: 'PLANNING',     label: 'Planning',           desc: 'Running terraform plan',                 icon: 'p' },
  { key: 'APPLYING',     label: 'Applying',           desc: 'Provisioning AWS resources',             icon: 'a' },
  { key: 'COMPLETED',    label: 'Completed',          desc: 'Infrastructure is live!',                icon: 'c' },
];

const DESTROY_STEPS = [
  { key: 'DESTROYING',   label: 'Destroying',         desc: 'Running terraform destroy',              icon: 'd' },
  { key: 'DESTROYED',    label: 'Destroyed',          desc: 'Infrastructure has been removed',        icon: 'x' },
];

const STATUS_ORDER = ['PENDING', 'INITIALIZING', 'PLANNING', 'APPLYING', 'COMPLETED', 'FAILED'];

const DeploymentStatusPage = () => {
  const location  = useLocation();
  const navigate  = useNavigate();
  const resourceRef = useRef(null);

  const [deploymentId, setDeploymentId]     = useState(location.state?.deploymentId || null);
  const [deployment, setDeployment]         = useState(null);
  const [starting, setStarting]             = useState(false);
  const [error, setError]                   = useState('');
  const [showDestroyConfirm, setShowDestroyConfirm] = useState(false);
  const [destroying, setDestroying]         = useState(false);
  const [pollingActive, setPollingActive]   = useState(false);
  const [activeResources, setActiveResources] = useState(null);

  const requirements   = location.state?.requirements;
  const recommendation = location.state?.recommendation;

  // Poll status every 2 seconds while active
  const poll = useCallback(async (id) => {
    try {
      const data = await getDeploymentStatus(id);
      setDeployment(data);
      const terminal = ['COMPLETED', 'FAILED', 'DESTROYED'].includes(data.status);
      return terminal;
    } catch (e) {
      console.error('Polling error:', e);
      return false;
    }
  }, []);

  useEffect(() => {
    if (!deploymentId) return;
    let interval;
    setPollingActive(true);

    const run = async () => {
      const done = await poll(deploymentId);
      if (done) {
        clearInterval(interval);
        setPollingActive(false);
      }
    };
    run();
    interval = setInterval(run, 2000);
    return () => clearInterval(interval);
  }, [deploymentId, poll]);

  useEffect(() => {
    if (deployment?.status === 'COMPLETED' && !activeResources) {
      getDeploymentResources(deploymentId)
        .then(res => setActiveResources(res))
        .catch(console.error);
    }
    // Clear resources if destroying
    if (deployment?.status === 'DESTROYING') {
      setActiveResources(null);
    }
  }, [deployment?.status, deploymentId, activeResources]);

  const handleStartDeploy = async () => {
    if (!requirements) {
      setError('No requirements found. Please go back to the dashboard.');
      return;
    }
    setStarting(true);
    setError('');
    try {
      const res = await startDeployment(requirements, recommendation);
      setDeploymentId(res.deploymentId);
    } catch (e) {
      setError(e.message);
    } finally {
      setStarting(false);
    }
  };

  const handleDestroy = async () => {
    setShowDestroyConfirm(false);
    setDestroying(true);
    try {
      await destroyDeployment(deploymentId);
      setDeployment(prev => ({ ...prev, status: 'DESTROYING' }));
    } catch (e) {
      setError(e.message);
    } finally {
      setDestroying(false);
    }
  };

  const handleScrollToResources = () => {
    resourceRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleStop = async () => {
    if (!window.confirm('Are you sure you want to stop the current deployment process? This may leave your infrastructure in a partial state.')) {
      return;
    }
    try {
      await stopDeployment(deploymentId);
      // Immediately poll to show the "Cancelled" status
      poll(deploymentId);
    } catch (e) {
      setError('Failed to stop deployment: ' + e.message);
    }
  };

  const ALL_ORDER = ['PENDING', 'INITIALIZING', 'PLANNING', 'APPLYING', 'COMPLETED', 'DESTROYING', 'DESTROYED'];

  const getStepState = (stepKey) => {
    if (!deployment) return 'waiting';
    if (deployment.status === 'FAILED') return 'failed';
    
    // Terminal success states should show as 'done' (green checkmark)
    if (deployment.status === 'COMPLETED' && stepKey === 'COMPLETED') return 'done';
    if (deployment.status === 'DESTROYED' && stepKey === 'DESTROYED') return 'done';
    
    const statusIdx = ALL_ORDER.indexOf(deployment.status);
    const stepIdx   = ALL_ORDER.indexOf(stepKey);
    
    if (stepKey === deployment.status) return 'active';
    if (stepIdx !== -1 && statusIdx !== -1 && stepIdx < statusIdx) return 'done';
    
    return 'waiting';
  };

  const getStatusBadgeClass = (status) => {
    const map = {
      PENDING: 'badge-pending', INITIALIZING: 'badge-initializing',
      PLANNING: 'badge-planning', APPLYING: 'badge-applying',
      COMPLETED: 'badge-completed', FAILED: 'badge-failed',
      DESTROYING: 'badge-destroying', DESTROYED: 'badge-destroyed',
    };
    return map[status] || 'badge-pending';
  };

  const isDestroying = deployment?.status === 'DESTROYING' || deployment?.status === 'DESTROYED';
  const allSteps     = isDestroying ? [...STEPS.slice(0, 4), ...DESTROY_STEPS] : STEPS;

  return (
    <div className="section">
      <div className="container" style={{ maxWidth: '1000px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div className="hero-badge" style={{ marginBottom: '0.75rem' }}>Deployment Center</div>
            <h1 style={{ fontSize: '2rem', marginBottom: '0.375rem' }}>Infrastructure Provisioning</h1>
            {deploymentId && (
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Deployment ID: {deploymentId}
              </p>
            )}
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link to="/requirements" className="btn btn-ghost btn-sm">← Back to Dashboard</Link>
            <Link to="/history" className="btn btn-ghost btn-sm">📋 View History</Link>
          </div>
        </div>

        {/* Error */}
        {error && <div className="alert alert-error mb-3">Error: {error}</div>}

        {/* === Pre-deploy: show Deploy button === */}
        {!deploymentId && (
          <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
            <h2 style={{ marginBottom: '0.75rem' }}>Initialize Deployment</h2>
            {requirements ? (
              <>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  App Type: <strong style={{ color: 'var(--text-primary)' }}>{requirements.applicationType}</strong> ·
                  Region: <strong style={{ color: 'var(--text-primary)' }}>{requirements.awsRegion || 'us-east-1'}</strong> ·
                  Traffic: <strong style={{ color: 'var(--text-primary)' }}>{requirements.traffic}</strong>
                </p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '2rem' }}>
                  This will run <code style={{ color: 'var(--accent)' }}>terraform init → plan → apply</code> on AWS.
                  Ensure your <code style={{ color: 'var(--accent)' }}>AWS_ACCESS_KEY_ID</code> and <code style={{ color: 'var(--accent)' }}>AWS_SECRET_ACCESS_KEY</code> are set.
                </p>
                <div style={{ maxWidth: '360px', margin: '0 auto' }}>
                  <button
                    className="btn btn-deploy w-full"
                    onClick={handleStartDeploy}
                    disabled={starting}
                    style={{ fontSize: '1.0625rem', padding: '1rem 2rem' }}
                  >
                    {starting ? <><span className="spin">/</span> Initializing...</> : <>Provision Infrastructure</>}
                  </button>
                </div>
              </>
            ) : (
              <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                No requirements found.
                <Link to="/requirements" style={{ color: 'var(--primary)', marginLeft: '0.5rem' }}>
                  Go back to Dashboard →
                </Link>
              </p>
            )}
          </div>
        )}

        {/* === Active deployment === */}
        {deploymentId && deployment && (
          <div className="grid grid-2" style={{ gap: '1.5rem', alignItems: 'start' }}>
            {/* Left: Steps + Status */}
            <div>
              {/* Status banner */}
              <div className="card" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '1rem' }}>Status</span>
                  <span className={`badge ${getStatusBadgeClass(deployment.status)}`}>
                    <span className="badge-dot" />
                    {deployment.status}
                  </span>
                </div>
                {deployment.moduleType && (
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <span className="module-badge">module.{deployment.moduleType}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                      Location: {deployment.awsRegion} · {deployment.instanceType}
                    </span>
                  </div>
                )}
              </div>

              {/* Step indicator */}
              <div className="card" style={{ padding: '1.75rem' }}>
                <h3 style={{ fontSize: '1rem', marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
                  Deployment Steps
                </h3>
                <div className="deploy-steps">
                  {STEPS.map((step, i) => {
                    const state = getStepState(step.key);
                    return (
                      <div key={step.key} className={`deploy-step step-${state === 'done' ? 'done' : state === 'active' ? 'active' : 'waiting'}`}>
                        <div className="step-icon">
                          {state === 'done' ? '✓' : state === 'active' ? step.icon : i + 1}
                        </div>
                        <div className="step-content">
                          <div className="step-title" style={{
                            color: state === 'done' ? 'var(--success)' :
                                   state === 'active' ? 'var(--primary)' : 'var(--text-muted)'
                          }}>
                            {step.label}
                          </div>
                          <div className="step-desc">{step.desc}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Stop button (only during active deployment) */}
              {['INITIALIZING', 'PLANNING', 'APPLYING'].includes(deployment.status) && (
                <div style={{ marginTop: '1rem' }}>
                  <button
                    className="btn btn-outline btn-sm w-full"
                    onClick={handleStop}
                    style={{ borderColor: 'var(--error)', color: 'var(--error)' }}
                  >
                    🛑 Stop Deployment
                  </button>
                </div>
              )}

              {/* Destroy button */}
              {['COMPLETED', 'FAILED'].includes(deployment.status) && !isDestroying && (
                <div style={{ marginTop: '1rem' }}>
                  <button
                    className="btn btn-danger w-full"
                    onClick={() => setShowDestroyConfirm(true)}
                    disabled={destroying}
                  >
                    Destroy Infrastructure
                  </button>
                </div>
              )}
            </div>

            {/* Right: Logs + Outputs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Logs */}
              <div className="card" style={{ padding: '1.5rem' }}>
                <LogViewer logs={deployment.logs} />
              </div>

              {/* Output Resources */}
              {deployment.status === 'COMPLETED' && (
                <div className="card" style={{ padding: '1.5rem' }}>
                  <h3 style={{ fontSize: '1rem', marginBottom: '1.25rem', color: 'var(--success)' }}>
                    Provisioning Success
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <ResourceSummaryCard
                      label="Public IP / DNS"
                      value={deployment.publicIp}
                      color="var(--primary)"
                      copyable={true}
                    />
                    <ResourceSummaryCard
                      label="Endpoint URL"
                      value={deployment.endpointUrl}
                      color="var(--accent)"
                      copyable={true}
                    />
                    <ResourceSummaryCard
                      label="Module Managed"
                      value={deployment.moduleType}
                      color="var(--purple)"
                    />
                    <ResourceSummaryCard
                      label="AWS Region"
                      value={deployment.awsRegion}
                      color="var(--warning)"
                    />
                    {deployment.estimatedCost && (
                      <ResourceSummaryCard
                        label="Estimated Monthly Cost"
                        value={`$${deployment.estimatedCost.toFixed(2)}/mo (≈ ₹${(deployment.estimatedCost * 84).toFixed(0)})`}
                        color="var(--success)"
                      />
                    )}
                  </div>
                  {deployment.endpointUrl && (
                    <a
                      href={deployment.endpointUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-accent w-full"
                      style={{ marginTop: '1rem', textDecoration: 'none' }}
                    >
                       Open Live Endpoint
                    </a>
                  )}

                  {activeResources && activeResources.length > 0 && (
                    <button 
                      className="btn btn-outline w-full" 
                      onClick={handleScrollToResources}
                      style={{ marginTop: '0.75rem' }}
                    >
                      🔍 Inspect Running Resources
                    </button>
                  )} 
                  {/* Active Services Listing */}
                  {activeResources && activeResources.length > 0 && (
                    <div 
                      ref={resourceRef}
                      style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}
                    >
                      <h4 style={{ fontSize: '0.9375rem', marginBottom: '0.75rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ color: 'var(--warning)' }}>☁</span> Provisioned AWS Resources
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {activeResources.map((res, idx) => (
                          <div key={idx} style={{ padding: '0.6rem 1rem', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            {res}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Failed state */}
              {deployment.status === 'FAILED' && (
                <div className="alert alert-error">
                  <span>Status: Fail</span>
                  <div>
                    <strong>Deployment Failed</strong>
                    <p style={{ marginBottom: 0, marginTop: '0.25rem', fontSize: '0.875rem' }}>
                      Check the logs above for details. Common causes: missing AWS credentials, insufficient permissions, or Terraform not installed.
                    </p>
                  </div>
                </div>
              )}

              {/* Destroyed state */}
              {deployment.status === 'DESTROYED' && (
                <div className="alert alert-warning">
                  <span>Archive</span>
                  <div>
                    <strong>Infrastructure Destroyed</strong>
                    <p style={{ marginBottom: 0, marginTop: '0.25rem', fontSize: '0.875rem' }}>
                      All AWS resources have been removed. Deployment is archived in history.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* === Destroy Confirmation Modal === */}
        {showDestroyConfirm && (
          <div className="modal-overlay" onClick={() => setShowDestroyConfirm(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ marginBottom: '0.75rem', color: 'var(--error)' }}>Destroy Infrastructure?</h2>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  This will run <code style={{ color: 'var(--error)' }}>terraform destroy -auto-approve</code> and permanently delete all AWS resources for deployment <strong>{deploymentId?.substring(0, 8)}</strong>. This cannot be undone.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button className="btn btn-ghost w-full" onClick={() => setShowDestroyConfirm(false)}>
                  Cancel
                </button>
                <button className="btn btn-danger w-full" onClick={handleDestroy}>
                  Confirm Destruction
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeploymentStatusPage;
