import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
    return (
        <div>
            {/* ===== Hero Section ===== */}
            <section className="hero-section">
                <div className="hero-bg" />
                <div className="hero-grid" />
                <div className="container hero-content">
                    <div className="hero-badge">
                        DevSecOps Optimization
                    </div>
                    <h1 className="hero-title">
                        Automated <br />
                        <span className="gradient-text">Cloud Infrastructure</span>
                    </h1>
                    <p className="hero-subtitle">
                        Get intelligent AWS recommendations, then provision real infrastructure with
                        a single click — powered by Terraform modules and production-grade DevOps practices.
                    </p>
                    <div className="hero-cta">
                        <Link to="/requirements" className="btn btn-primary btn-large">
                            Start Analysis
                        </Link>
                        <Link to="/how-it-works" className="btn btn-ghost btn-large">
                            Technical Overview
                        </Link>
                    </div>

                    <div className="hero-stats">
                        {[
                            { value: '5+', label: 'App Types' },
                            { value: '3', label: 'Terraform Modules' },
                            { value: '10+', label: 'AWS Services' },
                            { value: '100%', label: 'Deterministic' },
                        ].map((stat, i) => (
                            <div key={i} className="hero-stat-item">
                                <div className="hero-stat-value">{stat.value}</div>
                                <div className="hero-stat-label">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== Pipeline Flow ===== */}
            <section className="section" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                <div className="container">
                    <div className="text-center mb-4">
                        <h2 className="section-title">From Input to Infrastructure</h2>
                        <p className="section-subtitle" style={{ margin: '0 auto 2rem' }}>
                            A fully automated pipeline — from your requirements to live AWS resources
                        </p>
                    </div>
                    <div className="pipeline">
                        {[
                            { label: 'Requirements' },
                            { label: 'Analytics' },
                            { label: 'Module Provision' },
                            { label: 'Configuration' },
                            { label: 'Terraform Lifecycle' },
                            { label: 'AWS Environment' },
                        ].map((step, i, arr) => (
                            <React.Fragment key={i}>
                                <div className="pipeline-step">
                                    <div className="pipeline-label">{step.label}</div>
                                </div>
                                {i < arr.length - 1 && <div className="pipeline-arrow">→</div>}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== Features Grid ===== */}
            <section className="section">
                <div className="container">
                    <div className="text-center mb-4">
                        <h2 className="section-title">Everything You Need</h2>
                        <p className="section-subtitle" style={{ margin: '0 auto 2rem' }}>
                            A production-grade platform that handles the full DevSecOps lifecycle
                        </p>
                    </div>
                    <div className="grid grid-3">
                        {[
                            { color: 'var(--primary-glow)', title: 'Cloud Recommendation Engine', desc: 'Rule-based selection of optimal AWS services based on traffic patterns and performance requirements.' },
                            { color: 'rgba(139,92,246,0.15)', title: 'IaC Orchestration', desc: 'Validated Terraform modules for web applications, scalable APIs, and high-availability storage configurations.' },
                            { color: 'var(--success-glow)', title: 'Automated Provisioning', desc: 'Direct Terraform integration for AWS environment initialization and resource lifecycle management.' },
                            { color: 'var(--accent-glow)', title: 'Financial Analysis', desc: 'Detailed cost projections and resource utilization estimates for budget compliance.' },
                            { color: 'var(--warning-glow)', title: 'Verification Layer', desc: 'Preliminary plan review permitting resource analysis before final execution.' },
                            { color: 'var(--error-glow)', title: 'Persistence Archive', desc: 'Secure history of deployment attempts and infrastructure states maintained in a local vault.' },
                        ].map((f, i) => (
                            <div key={i} className="feature-card">
                                <h4 className="card-title">{f.title}</h4>
                                <p className="card-content" style={{ marginBottom: 0 }}>{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== Terraform Modules ===== */}
            <section className="section" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                <div className="container">
                    <div className="text-center mb-4">
                        <h2 className="section-title">Reusable Terraform Modules</h2>
                        <p className="section-subtitle" style={{ margin: '0 auto 2rem' }}>
                            Auto-selected based on your application type
                        </p>
                    </div>
                    <div className="grid grid-3">
                        {[
                            {
                                name: 'web_app',
                                color: 'var(--primary)',
                                desc: 'EC2 Virtual Machines',
                                resources: ['EC2 t3 Compute Instances', 'Network Security Groups', 'Automated Provisioning Scripts'],
                                uses: 'Backend Services'
                            },
                            {
                                name: 'scalable_app',
                                color: 'var(--accent)',
                                desc: 'Managed Scaling',
                                resources: ['Application Load Balancing', 'Launch Configuration', 'Auto Scaling Groups'],
                                uses: 'High Traffic APIs'
                            },
                            {
                                name: 'storage_app',
                                color: 'var(--purple)',
                                desc: 'Static Infrastructure',
                                resources: ['Bucket Architecture', 'Resource Encryption', 'CloudFront Content Distribution'],
                                uses: 'Distribution / Asset Hosting'
                            },
                        ].map((mod, i) => (
                            <div key={i} className="card card-glass" style={{ padding: '1.75rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                    <div>
                                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: mod.color, fontWeight: 700 }}>
                                            module.{mod.name}
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{mod.desc}</div>
                                    </div>
                                </div>
                                <ul style={{ listStyle: 'none', paddingLeft: 0, marginBottom: '1rem' }}>
                                    {mod.resources.map((r, j) => (
                                        <li key={j} style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', padding: '0.25rem 0', display: 'flex', gap: '0.5rem' }}>
                                            <span style={{ color: mod.color }}>—</span> {r}
                                        </li>
                                    ))}
                                </ul>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
                                    Applied to: <span style={{ color: mod.color, fontWeight: 600 }}>{mod.uses}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== CTA ===== */}
            <section className="section">
                <div className="container text-center">
                    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                        <h2 className="section-title mb-2">Ready to Deploy?</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '1.0625rem' }}>
                            Answer 6 questions and get your infrastructure provisioned on AWS — no DevOps expertise required.
                        </p>
                        <div className="hero-cta">
                            <Link to="/requirements" className="btn btn-primary btn-large">
                                Analyze Environment
                            </Link>
                            <Link to="/history" className="btn btn-ghost btn-large">
                                Deployment Archive
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default LandingPage;
