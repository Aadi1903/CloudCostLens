import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
    const location = useLocation();

    return (
        <header className="header">
            <div className="container header-content">
                <Link to="/" className="logo">
                    CloudCostLens
                </Link>
                <nav className="nav">
                    <Link
                        to="/"
                        className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
                    >
                        Home
                    </Link>
                    <Link
                        to="/how-it-works"
                        className={`nav-link ${location.pathname === '/how-it-works' ? 'active' : ''}`}
                    >
                        How It Works
                    </Link>
                    <Link
                        to="/requirements"
                        className={`nav-link ${location.pathname === '/requirements' ? 'active' : ''}`}
                    >
                        Get Started
                    </Link>
                    <Link
                        to="/about"
                        className={`nav-link ${location.pathname === '/about' ? 'active' : ''}`}
                    >
                        About
                    </Link>
                </nav>
            </div>
        </header>
    );
};

export default Header;
