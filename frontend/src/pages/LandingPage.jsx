import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
    return (
        <div>
            {/* Hero Section */}
            <section className="section" style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                padding: '5rem 0'
            }}>
                <div className="container text-center">
                    <h1 style={{ color: 'white', marginBottom: '1.5rem' }}>
                        CloudCostLens
                    </h1>
                    <p style={{
                        fontSize: '1.25rem',
                        color: 'rgba(255, 255, 255, 0.9)',
                        maxWidth: '700px',
                        margin: '0 auto 2rem'
                    }}>
                        Where cloud costs make sense
                    </p>
                    <p style={{
                        fontSize: '1rem',
                        color: 'rgba(255, 255, 255, 0.8)',
                        maxWidth: '700px',
                        margin: '0 auto 2rem'
                    }}>
                        Get deterministic, budget-safe AWS service recommendations based on your requirements.
                        No guesswork, no AI hallucinations—just rule-based, explainable decisions.
                    </p>
                    <Link to="/requirements" className="btn btn-primary btn-large">
                        Start Planning
                    </Link>
                </div>
            </section>

            {/* Problem Statement */}
            <section className="section">
                <div className="container">
                    <div className="text-center" style={{ maxWidth: '800px', margin: '0 auto' }}>
                        <h2 className="mb-3">The Challenge</h2>
                        <p style={{ fontSize: '1.125rem' }}>
                            Choosing the right AWS services is complex and costly. With hundreds of services available,
                            it's easy to overspend or select services that don't match your needs.
                        </p>
                    </div>

                    <div className="grid grid-3 mt-4">
                        <div className="card text-center">
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💸</div>
                            <h4 className="card-title">Budget Uncertainty</h4>
                            <p className="card-content">
                                Hard to estimate costs before deployment
                            </p>
                        </div>
                        <div className="card text-center">
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🤔</div>
                            <h4 className="card-title">Service Overload</h4>
                            <p className="card-content">
                                Too many options make decision-making difficult
                            </p>
                        </div>
                        <div className="card text-center">
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚙️</div>
                            <h4 className="card-title">Operational Complexity</h4>
                            <p className="card-content">
                                Balancing performance with maintenance effort
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Solution */}
            <section className="section" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                <div className="container">
                    <div className="text-center" style={{ maxWidth: '800px', margin: '0 auto' }}>
                        <h2 className="mb-3">Our Solution</h2>
                        <p style={{ fontSize: '1.125rem' }}>
                            A deterministic recommendation system that uses rule-based logic to suggest
                            AWS architectures tailored to your application type, traffic, storage needs, and budget.
                        </p>
                    </div>

                    <div className="grid grid-2 mt-4">
                        <div className="card">
                            <h4 className="card-title">✓ Deterministic Logic</h4>
                            <p className="card-content">
                                No AI guesswork—every recommendation is based on transparent, repeatable rules
                            </p>
                        </div>
                        <div className="card">
                            <h4 className="card-title">✓ Budget-Safe</h4>
                            <p className="card-content">
                                Get cost estimates upfront and stay within your monthly budget
                            </p>
                        </div>
                        <div className="card">
                            <h4 className="card-title">✓ Explainable</h4>
                            <p className="card-content">
                                Understand exactly why each service was recommended for your use case
                            </p>
                        </div>
                        <div className="card">
                            <h4 className="card-title">✓ Educational</h4>
                            <p className="card-content">
                                Learn about AWS services and make informed architecture decisions
                            </p>
                        </div>
                    </div>

                    <div className="text-center mt-4">
                        <Link to="/how-it-works" className="btn btn-secondary">
                            Learn How It Works
                        </Link>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="section">
                <div className="container text-center">
                    <h2 className="mb-3">Ready to Get Started?</h2>
                    <p style={{ fontSize: '1.125rem', marginBottom: '2rem' }}>
                        Answer a few questions about your application and get personalized AWS recommendations
                    </p>
                    <Link to="/requirements" className="btn btn-primary btn-large">
                        Get Your Recommendations
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default LandingPage;
