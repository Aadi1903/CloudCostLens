import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ServiceCard from '../components/ServiceCard';
import CostBreakdown from '../components/CostBreakdown';

const RecommendationPage = () => {
    const navigate = useNavigate();
    const [recommendation, setRecommendation] = useState(null);
    const [requirements, setRequirements] = useState(null);

    useEffect(() => {
        const storedRecommendation = sessionStorage.getItem('recommendation');
        const storedRequirements = sessionStorage.getItem('requirements');

        if (!storedRecommendation || !storedRequirements) {
            navigate('/requirements');
            return;
        }

        setRecommendation(JSON.parse(storedRecommendation));
        setRequirements(JSON.parse(storedRequirements));
    }, [navigate]);

    if (!recommendation || !requirements) {
        return null;
    }

    return (
        <div className="section">
            <div className="container">
                {/* Header */}
                <div className="text-center mb-4">
                    <h1>Your AWS Architecture Recommendation</h1>
                    <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)' }}>
                        Based on your requirements, here's our recommended AWS architecture
                    </p>
                </div>

                {/* Status Message */}
                {recommendation.message && (
                    <div style={{
                        padding: '1rem',
                        backgroundColor: recommendation.withinBudget ? 'rgba(72, 187, 120, 0.1)' : 'rgba(245, 101, 101, 0.1)',
                        border: `1px solid ${recommendation.withinBudget ? 'var(--success)' : 'var(--error)'}`,
                        borderRadius: 'var(--radius-md)',
                        color: recommendation.withinBudget ? 'var(--success)' : 'var(--error)',
                        marginBottom: '2rem',
                        textAlign: 'center',
                        fontWeight: '600'
                    }}>
                        {recommendation.message}
                    </div>
                )}

                {/* Main Content Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', marginBottom: '3rem' }}>
                    {/* Recommended Services */}
                    <div>
                        <h2 className="mb-3">Recommended Services</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {recommendation.architecture.map((service, index) => (
                                <ServiceCard
                                    key={index}
                                    service={service.service}
                                    category={service.category}
                                    reason={service.reason}
                                    cost={service.estimatedCost}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Cost Breakdown */}
                    <div>
                        <CostBreakdown
                            services={recommendation.architecture}
                            totalCost={recommendation.totalCost}
                            budget={recommendation.budget}
                            withinBudget={recommendation.withinBudget}
                        />
                    </div>
                </div>

                {/* Alternative Architectures */}
                {recommendation.alternatives && recommendation.alternatives.length > 0 && (
                    <div>
                        <h2 className="mb-3">Alternative Architectures</h2>
                        <div className="grid grid-2">
                            {recommendation.alternatives.map((alt, index) => (
                                <div key={index} className="card">
                                    <h3 className="card-title">{alt.name}</h3>
                                    <p className="card-content">{alt.description}</p>

                                    <div style={{ marginTop: '1rem' }}>
                                        <strong>Services:</strong>
                                        <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
                                            {alt.services.map((service, idx) => (
                                                <li key={idx} style={{ color: 'var(--text-secondary)' }}>{service}</li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div style={{
                                        marginTop: '1rem',
                                        padding: '0.75rem',
                                        backgroundColor: 'var(--bg-secondary)',
                                        borderRadius: 'var(--radius-md)',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}>
                                        <span style={{ fontWeight: '600' }}>Estimated Cost:</span>
                                        <span style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--primary)' }}>
                                            ${alt.totalCost.toFixed(2)}/mo
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div style={{
                    marginTop: '3rem',
                    padding: '2rem',
                    backgroundColor: 'var(--bg-secondary)',
                    borderRadius: 'var(--radius-lg)',
                    textAlign: 'center'
                }}>
                    <h3 className="mb-2">Want to Try Different Requirements?</h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                        Adjust your application requirements to see how recommendations change
                    </p>
                    <button
                        onClick={() => navigate('/requirements')}
                        className="btn btn-primary"
                    >
                        Try Different Requirements
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RecommendationPage;
