import React from 'react';

export default function Footer() {
  const siteName = 'BLOGGA';
  return (
    <footer id="site-footer" className="py-3">
      <div className="container d-flex justify-content-between align-items-center">
        <div className="logo">
          <span className="brand">
            <span className="brand-initial">B</span>
            <span className="brand-rest">LOGGA</span>
          </span>
        </div>
        <div className="copyright text-muted small">
          © {new Date().getFullYear()} {siteName.toUpperCase()}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
