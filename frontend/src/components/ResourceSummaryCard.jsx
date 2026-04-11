import React from 'react';

/**
 * AWS-styled resource output card for deployment results.
 */
const ResourceSummaryCard = ({ icon, label, value, color = 'var(--primary)', copyable = false }) => {
  const handleCopy = () => {
    if (value) navigator.clipboard.writeText(value);
  };

  return (
    <div className="resource-card">
      {icon && (
        <div
          className="resource-card-icon"
          style={{ background: `${color}20`, border: `1px solid ${color}40` }}
        >
          {icon}
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="resource-card-label">{label}</div>
        <div className="resource-card-value" style={{ wordBreak: 'break-all' }}>
          {value || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.875rem' }}>Not available</span>}
        </div>
      </div>
      {copyable && value && (
        <button
          onClick={handleCopy}
          className="btn btn-ghost btn-sm"
          title="Copy to clipboard"
          style={{ flexShrink: 0, fontSize: '0.75rem' }}
        >
          Copy
        </button>
      )}
    </div>
  );
};

export default ResourceSummaryCard;
