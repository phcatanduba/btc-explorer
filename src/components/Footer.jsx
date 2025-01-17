import React from 'react';
import './Footer.css';

function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="footer">
            <div className="footer-content">
                <p className="copyright">
                    © {currentYear} BTC Explorer. All rights reserved.
                </p>
                <div className="footer-links">
                    <a 
                        href="https://github.com/phcatanduba/btc-explorer/blob/main/LICENSE" 
                        target="_blank" 
                        rel="noopener noreferrer"
                    >
                        MIT License
                    </a>
                </div>
            </div>
        </footer>
    );
}

export default Footer; 