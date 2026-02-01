import React from 'react';
import ExplainerSection from './ExplainerSection';

const ArchitectureDiagram = ({ selectedArchitecture }) => {
    if (!selectedArchitecture || !selectedArchitecture.services) return null;

    // Group services by category for visualization (case-insensitive)
    const services = selectedArchitecture.services;
    const compute = services.filter(s => s.category?.toLowerCase() === 'compute');
    const db = services.filter(s => s.category?.toLowerCase() === 'database');
    const storage = services.filter(s => s.category?.toLowerCase() === 'storage');
    // Others like networking/security can be grouping or shown generally

    // Simple visual style for boxes
    const boxStyle = {
        padding: '0.75rem',
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--primary)',
        borderRadius: 'var(--radius-md)',
        textAlign: 'center',
        fontSize: '0.85rem',
        fontWeight: '500',
        minWidth: '120px',
        color: 'var(--text-primary)'
    };

    const arrowStyle = {
        fontSize: '1.5rem',
        color: 'var(--text-muted)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '40px'
    };

    const containerStyle = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '1rem',
        backgroundColor: 'rgba(0,0,0,0.02)',
        borderRadius: 'var(--radius-lg)'
    };

    const hasDataLayer = db.length > 0 || storage.length > 0;

    return (
        <ExplainerSection title="View Architecture Overview">
            <div style={{ textAlign: 'center', marginBottom: '1rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
                Logical Architecture Overview
            </div>

            <div style={containerStyle}>
                {/* Users / Client */}
                <div style={{ ...boxStyle, borderStyle: 'dashed' }}>Users / Client</div>

                <div style={arrowStyle}>↓</div>

                {/* Networking / Load Balancer if present in services or implicitly assumed for web apps */}
                <div style={boxStyle}>
                    Load Balancer / Gateway
                </div>

                <div style={arrowStyle}>↓</div>

                {/* Compute Layer */}
                <div style={{
                    ...boxStyle,
                    backgroundColor: 'rgba(66, 153, 225, 0.1)',
                    borderColor: '#4299e1',
                    width: '100%',
                    maxWidth: '400px'
                }}>
                    <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#4299e1', marginBottom: '0.5rem' }}>Compute Layer</div>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                        {compute.length > 0 ? compute.map((s, i) => (
                            <div key={i} style={{
                                padding: '0.25rem 0.5rem',
                                background: 'white',
                                borderRadius: '4px',
                                border: '1px solid #bee3f8',
                                fontSize: '0.8rem'
                            }}>
                                {s.service}
                            </div>
                        )) : <div>Server / Instance</div>}
                    </div>
                </div>

                {hasDataLayer && (
                    <>
                        <div style={arrowStyle}>↓</div>

                        {/* Data Layer */}
                        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center', width: '100%' }}>
                            {/* Database */}
                            {db.length > 0 && (
                                <div style={{ ...boxStyle, backgroundColor: 'rgba(72, 187, 120, 0.1)', borderColor: '#48bb78', flex: 1 }}>
                                    <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#48bb78', marginBottom: '0.5rem' }}>Database</div>
                                    {db.map((s, i) => <div key={i}>{s.service}</div>)}
                                </div>
                            )}

                            {/* Storage */}
                            {storage.length > 0 && (
                                <div style={{ ...boxStyle, backgroundColor: 'rgba(237, 137, 54, 0.1)', borderColor: '#ed8936', flex: 1 }}>
                                    <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#ed8936', marginBottom: '0.5rem' }}>Object Storage</div>
                                    {storage.map((s, i) => <div key={i}>{s.service}</div>)}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
            <p style={{ fontSize: '0.75rem', textAlign: 'center', marginTop: '1rem', color: 'var(--text-muted)' }}>
                *Diagram represents logical flow. Actual networking setup may vary.
            </p>
        </ExplainerSection>
    );
};

export default ArchitectureDiagram;
