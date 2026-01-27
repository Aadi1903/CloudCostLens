import React from 'react';

const ServiceCard = ({ service, category, reason, cost }) => {
    const getCategoryColor = (cat) => {
        const colors = {
            compute: '#FF6B35',
            storage: '#004E89',
            database: '#1A659E',
            networking: '#48BB78',
            messaging: '#F6AD55',
            monitoring: '#9F7AEA',
            security: '#F56565'
        };
        return colors[cat] || '#718096';
    };

    return (
        <div className="card">
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'start',
                marginBottom: '1rem'
            }}>
                <div>
                    <h4 className="card-title">{service}</h4>
                    <span style={{
                        display: 'inline-block',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '1rem',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        backgroundColor: `${getCategoryColor(category)}20`,
                        color: getCategoryColor(category)
                    }}>
                        {category}
                    </span>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--primary)' }}>
                        ${cost.toFixed(2)}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                        /month
                    </div>
                </div>
            </div>
            <p className="card-content">{reason}</p>
        </div>
    );
};

export default ServiceCard;
