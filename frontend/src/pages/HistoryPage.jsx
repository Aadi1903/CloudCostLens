import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllDeployments, destroyDeployment, getDeploymentResources } from '../api/deployApi';

const STATUS_BADGE = {
  PENDING:      'badge-pending',
  INITIALIZING: 'badge-initializing',
  PLANNING:     'badge-planning',
  APPLYING:     'badge-applying',
  COMPLETED:    'badge-completed',
  FAILED:       'badge-failed',
  DESTROYING:   'badge-destroying',
  DESTROYED:    'badge-destroyed',
};

const MODULE_ICONS = {
  web_app:      'W',
  scalable_app: 'S',
  storage_app:  'A',
};

const HistoryPage = () => {
  const [deployments, setDeployments]         = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [error, setError]                     = useState('');
  const [expandedId, setExpandedId]           = useState(null);
  const [resources, setResources]             = useState({}); // { deploymentId: [res1, res2] }
  const [destroyConfirm, setDestroyConfirm]   = useState(null); // deploymentId
  const [destroying, setDestroying]           = useState(false);

  const loadDeployments = async () => {
    try {
      setLoading(true);
      const data = await getAllDeployments();
      setDeployments(data);
    } catch (e) {
      setError('Failed to load deployment history: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadDeployments(); }, []);

  const handleDestroy = async (id) => {
    setDestroying(true);
    setDestroyConfirm(null);
    try {
      await destroyDeployment(id);
      await loadDeployments();
    } catch (e) {
      setError('Destroy failed: ' + e.message);
    } finally {
      setDestroying(false);
    }
  };

  const handleToggleExpand = async (id) => {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(id);
    // Fetch resources if not already loaded and deployment is COMPLETED
    const dep = deployments.find(d => d.id === id);
    if (dep && dep.status === 'COMPLETED' && !resources[id]) {
      try {
        const resList = await getDeploymentResources(id);
        setResources(prev => ({ ...prev, [id]: resList }));
      } catch (e) {
        console.error('Failed to fetch resources for history:', e);
      }
    }
  };

  const formatDate = (isoStr) => {
    if (!isoStr) return '—';
    return new Date(isoStr).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const duration = (start, end) => {
    if (!start || !end) return '—';
    const ms = new Date(end) - new Date(start);
    const s = Math.floor(ms / 1000);
    if (s < 60) return `${s}s`;
    return `${Math.floor(s / 60)}m ${s % 60}s`;
  };

  return (
    <div className="section">
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div className="hero-badge" style={{ marginBottom: '0.75rem' }}>Audit Trail</div>
            <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>Deployment History</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 0 }}>
              Database record of all infrastructure lifecycle events.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={loadDeployments} className="btn btn-ghost btn-sm" disabled={loading}>
              Refresh
            </button>
            <Link to="/requirements" className="btn btn-primary btn-sm">
              + New Deployment
            </Link>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-4" style={{ marginBottom: '2rem' }}>
          {[
            { label: 'Total',     value: deployments.length,                                          color: 'var(--primary)' },
            { label: 'Completed', value: deployments.filter(d => d.status === 'COMPLETED').length,    color: 'var(--success)' },
            { label: 'Failed',    value: deployments.filter(d => d.status === 'FAILED').length,       color: 'var(--error)' },
            { label: 'Destroyed', value: deployments.filter(d => d.status === 'DESTROYED').length,    color: 'var(--text-muted)' },
          ].map((s, i) => (
            <div key={i} className="card" style={{ padding: '1.25rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: s.color, fontFamily: 'var(--font-heading)' }}>{s.value}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Error */}
        {error && <div className="alert alert-error mb-3">{error}</div>}

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            <div className="spin" style={{ fontSize: '2rem', display: 'inline-block', marginBottom: '1rem' }}>/</div>
            <p>Loading deployment history...</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && deployments.length === 0 && (
          <div className="empty-state">
            <h3>No Deployments Found</h3>
            <p style={{ marginBottom: '1.5rem' }}>Start your first infrastructure deployment to see it here.</p>
            <Link to="/requirements" className="btn btn-primary">
              Initialize Deployment
            </Link>
          </div>
        )}

        {/* Table */}
        {!loading && deployments.length > 0 && (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="history-table">
              <thead>
                <tr>
                  <th>Deployment</th>
                  <th>Module</th>
                  <th>Region</th>
                  <th>Status</th>
                  <th>Cost</th>
                  <th>Created</th>
                  <th>Duration</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {deployments.map(d => (
                  <React.Fragment key={d.id}>
                    <tr
                      onClick={() => handleToggleExpand(d.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                          {d.id?.substring(0, 8)}…
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{d.applicationType}</div>
                      </td>
                      <td>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                          [{MODULE_ICONS[d.moduleType] || 'P'}] {d.moduleType}
                        </span>
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>{d.awsRegion}</td>
                      <td>
                        <span className={`badge ${STATUS_BADGE[d.status] || 'badge-pending'}`}>
                          <span className="badge-dot" />
                          {d.status}
                        </span>
                      </td>
                      <td style={{ color: 'var(--success)', fontWeight: 600 }}>
                        {d.estimatedCost ? `$${d.estimatedCost.toFixed(2)}/mo (≈ ₹${(d.estimatedCost * 84).toFixed(0)})` : '—'}
                      </td>
                      <td style={{ fontSize: '0.8rem' }}>{formatDate(d.createdAt)}</td>
                      <td style={{ fontSize: '0.8rem' }}>{duration(d.createdAt, d.completedAt)}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <Link
                            to="/deploy"
                            state={{ deploymentId: d.id }}
                            onClick={e => e.stopPropagation()}
                            className="btn btn-ghost btn-sm"
                          >
                            View
                          </Link>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleToggleExpand(d.id); }}
                            className={`btn btn-sm ${expandedId === d.id ? 'btn-primary' : 'btn-ghost'}`}
                          >
                            🔍
                          </button>
                          {['COMPLETED', 'FAILED'].includes(d.status) && (
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={e => { e.stopPropagation(); setDestroyConfirm(d.id); }}
                              disabled={destroying}
                            >
                              💣
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>

                    {/* Expanded row */}
                    {expandedId === d.id && (
                      <tr>
                        <td colSpan="8" style={{ padding: '1.25rem', background: 'var(--bg-secondary)' }}>
                          <div className="grid grid-2" style={{ gap: '1.25rem' }}>
                            <div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600 }}>
                                Output
                              </div>
                              {d.publicIp && <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', marginBottom: '0.25rem' }}>IP: {d.publicIp}</div>}
                              {d.endpointUrl && <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', marginBottom: '0.25rem' }}>URL: {d.endpointUrl}</div>}
                              
                              {resources[d.id] && resources[d.id].length > 0 && (
                                <div style={{ marginTop: '0.75rem' }}>
                                  <div style={{ fontSize: '0.7rem', color: 'var(--warning)', fontWeight: 600, marginBottom: '0.4rem' }}>PROVISIONED RESOURCES</div>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                                    {resources[d.id].map((r, i) => (
                                      <div key={i} style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', padding: '0.3rem 0.6rem', background: 'var(--border)', borderRadius: '4px' }}>
                                        {r}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {!d.publicIp && !d.endpointUrl && !resources[d.id] && <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>No dynamic output available</div>}
                            </div>
                            <div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600 }}>
                                Last Log Entry
                              </div>
                              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#3fb950', background: '#0d1117', padding: '0.625rem', borderRadius: 'var(--radius-md)' }}>
                                {d.logs && d.logs.length > 0 ? d.logs[d.logs.length - 1] : 'No logs.'}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Destroy Modal */}
      {destroyConfirm && (
        <div className="modal-overlay" onClick={() => setDestroyConfirm(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ color: 'var(--error)', marginBottom: '0.75rem' }}>Destroy Infrastructure?</h2>
              <p style={{ color: 'var(--text-secondary)' }}>
                This will permanently destroy all AWS resources for deployment <strong>{destroyConfirm.substring(0, 8)}</strong>. This cannot be undone.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="btn btn-ghost w-full" onClick={() => setDestroyConfirm(null)}>Cancel</button>
              <button className="btn btn-danger w-full" onClick={() => handleDestroy(destroyConfirm)}>
                Confirm Destruction
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
