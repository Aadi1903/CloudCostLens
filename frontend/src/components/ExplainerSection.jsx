import React, { useState } from 'react';

const ExplainerSection = ({ title, children, defaultExpanded = false }) => {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);

    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <div style={{
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--bg-card)',
            marginBottom: '1rem',
            overflow: 'hidden'
        }}>
            <button
                onClick={toggleExpand}
                style={{
                    width: '100%',
                    padding: '1rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontWeight: '600',
                    color: 'var(--text-primary)',
                    outline: 'none'
                }}
            >
                <span>{title}</span>
                <span style={{
                    transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease',
                    color: 'var(--text-secondary)'
                }}>
                    ▼
                </span>
            </button>

            {isExpanded && (
                <div style={{
                    padding: '0 1rem 1rem 1rem',
                    borderTop: '1px solid var(--border-light)',
                    color: 'var(--text-secondary)',
                    fontSize: '0.95rem',
                    lineHeight: '1.6'
                }}>
                    <div style={{ paddingTop: '1rem' }}>
                        {children}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExplainerSection;
