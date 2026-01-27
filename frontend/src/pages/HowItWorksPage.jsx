import React from 'react';

const HowItWorksPage = () => {
    return (
        <div>
            <section className="section">
                <div className="container">
                    <div className="text-center mb-4">
                        <h1>How It Works</h1>
                        <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)', maxWidth: '700px', margin: '1rem auto' }}>
                            Our system uses a deterministic, rule-based approach to recommend AWS services.
                            Here's how we make decisions—no AI, no guesswork.
                        </p>
                    </div>

                    {/* Process Steps */}
                    <div style={{ maxWidth: '900px', margin: '3rem auto' }}>
                        {/* Step 1 */}
                        <div style={{
                            display: 'flex',
                            gap: '2rem',
                            marginBottom: '3rem',
                            alignItems: 'center'
                        }}>
                            <div style={{
                                minWidth: '80px',
                                height: '80px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #FF6B35, #F6AD55)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '2rem',
                                fontWeight: '700',
                                color: 'white'
                            }}>
                                1
                            </div>
                            <div className="card" style={{ flex: 1 }}>
                                <h3 className="card-title">📝 Input Your Requirements</h3>
                                <p className="card-content">
                                    Tell us about your application type (static website, backend API, full-stack, etc.),
                                    expected traffic, storage needs, database requirements, operational preferences, and monthly budget.
                                </p>
                            </div>
                        </div>

                        {/* Step 2 */}
                        <div style={{
                            display: 'flex',
                            gap: '2rem',
                            marginBottom: '3rem',
                            alignItems: 'center'
                        }}>
                            <div style={{
                                minWidth: '80px',
                                height: '80px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #004E89, #1A659E)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '2rem',
                                fontWeight: '700',
                                color: 'white'
                            }}>
                                2
                            </div>
                            <div className="card" style={{ flex: 1 }}>
                                <h3 className="card-title">🔍 Filtering & Scoring</h3>
                                <p className="card-content">
                                    Our decision engine filters AWS services based on your use case and constraints,
                                    then scores each eligible service using a weighted algorithm:
                                </p>
                                <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
                                    <li><strong>Cost Match (40%):</strong> How well the service fits your budget</li>
                                    <li><strong>Scalability Match (30%):</strong> Can it handle your traffic?</li>
                                    <li><strong>Operational Match (20%):</strong> Matches your maintenance preference</li>
                                    <li><strong>Use Case Match (10%):</strong> Optimized for your application type</li>
                                </ul>
                            </div>
                        </div>

                        {/* Step 3 */}
                        <div style={{
                            display: 'flex',
                            gap: '2rem',
                            alignItems: 'center'
                        }}>
                            <div style={{
                                minWidth: '80px',
                                height: '80px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #48BB78, #38A169)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '2rem',
                                fontWeight: '700',
                                color: 'white'
                            }}>
                                3
                            </div>
                            <div className="card" style={{ flex: 1 }}>
                                <h3 className="card-title">📊 Get Recommendations</h3>
                                <p className="card-content">
                                    Receive a curated architecture with the top-ranked service from each category
                                    (compute, storage, database, etc.), complete with:
                                </p>
                                <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
                                    <li>Estimated monthly cost per service</li>
                                    <li>Clear explanation for each recommendation</li>
                                    <li>Budget validation and alternatives</li>
                                    <li>Performance-optimized and budget-optimized options</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Key Principles */}
                    <div style={{
                        background: 'var(--bg-secondary)',
                        padding: '2rem',
                        borderRadius: 'var(--radius-lg)',
                        marginTop: '3rem'
                    }}>
                        <h2 className="text-center mb-3">Core Principles</h2>
                        <div className="grid grid-3">
                            <div className="text-center">
                                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🎯</div>
                                <h4>Deterministic</h4>
                                <p className="text-secondary">
                                    Same inputs always produce same outputs
                                </p>
                            </div>
                            <div className="text-center">
                                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📖</div>
                                <h4>Explainable</h4>
                                <p className="text-secondary">
                                    Every decision has a clear reason
                                </p>
                            </div>
                            <div className="text-center">
                                <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🔁</div>
                                <h4>Repeatable</h4>
                                <p className="text-secondary">
                                    Consistent, reliable recommendations
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default HowItWorksPage;
