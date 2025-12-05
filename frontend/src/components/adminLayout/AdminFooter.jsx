import React from 'react'

export default function AdminFooter() {
  return (
    <footer className="admin-footer py-3" style={{ background: '#f8f9fa', borderTop: '1px solid #e9ecef' }}>
      <div className="container text-center" style={{ fontSize: '0.9rem', color: '#6b7280' }}>
        © {new Date().getFullYear()} Blog Project — Admin Panel
      </div>
    </footer>
  )
}
