import React, { useEffect, useState } from 'react';

/**
 * Polls GET /api/health/credentials and shows a dismissible warning banner
 * if AWS credentials are not configured.  Only renders if backend is online.
 */
const AwsCredentialBanner = () => {
  const [status, setStatus] = useState(null); // null = loading, true = ok, false = missing
  const [message, setMessage] = useState('');
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const check = async () => {
      try {
        const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:8080/api');
        const res = await fetch(`${API_BASE}/health/credentials`);
        if (!res.ok) return; // backend might be starting up
        const data = await res.json();
        setStatus(data.configured);
        setMessage(data.message || '');
      } catch {
        // Backend not reachable — don't show banner
      }
    };
    check();
  }, []);

  // Don't render if credentials are fine, backend offline, or user dismissed
  if (status === null || status === true || dismissed) return null;

  return (
    <div
      role="alert"
      style={{
        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(239, 68, 68, 0.10))',
        border: '1.5px solid rgba(245, 158, 11, 0.5)',
        borderRadius: '0',
        padding: '0.75rem 1.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        flexWrap: 'wrap',
        zIndex: 999,
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
        <span style={{ fontSize: '1.1rem' }}>⚠️</span>
        <div>
          <strong style={{ color: 'var(--warning)', fontSize: '0.9rem' }}>
            AWS Credentials Not Configured
          </strong>
          <p style={{ margin: 0, fontSize: '0.81rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
            {message} &nbsp;
            <span style={{ color: 'var(--text-muted)' }}>
              Recommendations will work, but Terraform deployments will fail.
            </span>
          </p>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexShrink: 0 }}>
        <a
          href="https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: '0.81rem',
            color: 'var(--warning)',
            textDecoration: 'underline',
            whiteSpace: 'nowrap',
          }}
        >
          How to get keys →
        </a>
        <button
          onClick={() => setDismissed(true)}
          aria-label="Dismiss"
          style={{
            background: 'none',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '0.25rem 0.5rem',
            fontSize: '0.75rem',
          }}
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default AwsCredentialBanner;
