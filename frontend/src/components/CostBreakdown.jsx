import React from 'react';

const CostBreakdown = ({ services, totalCost, budget, withinBudget }) => {
    const budgetPercentage = (totalCost / budget) * 100;

    return (
        <div className="card">
            <h3 className="card-title">Cost Breakdown</h3>

            <div style={{ marginTop: '1.5rem' }}>
                {services.map((service, index) => (
                    <div
                        key={index}
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            padding: '0.75rem 0',
                            borderBottom: index < services.length - 1 ? '1px solid var(--border)' : 'none'
                        }}
                    >
                        <span style={{ color: 'var(--text-secondary)' }}>{service.service}</span>
                        <span style={{ fontWeight: '600' }}>${service.estimatedCost.toFixed(2)}</span>
                    </div>
                ))}

                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '1rem 0',
                    marginTop: '1rem',
                    borderTop: '2px solid var(--border)',
                    fontSize: '1.25rem',
                    fontWeight: '700'
                }}>
                    <span>Total Monthly Cost</span>
                    <span style={{ color: 'var(--primary)' }}>${totalCost.toFixed(2)}</span>
                </div>

                <div style={{
                    marginTop: '1.5rem',
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: withinBudget ? 'rgba(72, 187, 120, 0.1)' : 'rgba(245, 101, 101, 0.1)'
                }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '0.5rem'
                    }}>
                        <span style={{ fontWeight: '600' }}>Budget</span>
                        <span style={{ fontWeight: '600' }}>${budget.toFixed(2)}</span>
                    </div>

                    <div style={{
                        width: '100%',
                        height: '8px',
                        backgroundColor: 'var(--bg-tertiary)',
                        borderRadius: '1rem',
                        overflow: 'hidden'
                    }}>
                        <div style={{
                            width: `${Math.min(budgetPercentage, 100)}%`,
                            height: '100%',
                            backgroundColor: withinBudget ? 'var(--success)' : 'var(--error)',
                            transition: 'width 0.5s ease'
                        }} />
                    </div>

                    <div style={{
                        marginTop: '0.5rem',
                        fontSize: '0.875rem',
                        color: withinBudget ? 'var(--success)' : 'var(--error)',
                        fontWeight: '600'
                    }}>
                        {withinBudget
                            ? `✓ Within budget (${budgetPercentage.toFixed(0)}% used)`
                            : `⚠ Over budget by $${(totalCost - budget).toFixed(2)}`
                        }
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CostBreakdown;
