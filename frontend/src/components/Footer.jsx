import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="container">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                    <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.125rem', background: 'linear-gradient(135deg, var(--primary), var(--accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                        CloudCostLens
                    </div>
                    <div style={{ display: 'flex', gap: '1.5rem' }}>
                        {[
                            { to: '/', label: 'Home' },
                            { to: '/requirements', label: 'Dashboard' },
                            { to: '/history', label: 'History' },
                            { to: '/about', label: 'About' },
                        ].map(link => (
                            <Link key={link.to} to={link.to} style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textDecoration: 'none', transition: 'var(--transition)' }}
                                onMouseEnter={e => e.target.style.color = 'var(--primary)'}
                                onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}>
                                {link.label}
                            </Link>
                        ))}
                    </div>
                </div>
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                        © 2026 CloudCostLens — DevSecOps Platform
                    </p>
                    <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                        Powered by Spring Boot · React · Terraform · AWS
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
