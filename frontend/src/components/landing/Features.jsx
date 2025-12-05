import React from 'react';

export default function Features() {
  return (
    <section id="features" className="py-5">
      <div className="container">
        <h2 className="mb-4">Platform Features</h2>
        <p className="text-center mb-4">Key features tailored for bloggers to create, manage and grow their content.</p>
        <div className="row g-4">
          <div className="col-md-4">
            <div className="card feature-card h-100">
              <div className="card-body">
                <h5 className="card-title">Manage your Blogs</h5>
                <p className="card-text">Create, edit, publish and delete posts with a simple editor and media management.</p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card feature-card h-100">
              <div className="card-body">
                <h5 className="card-title">Track the Views on your Blog</h5>
                <p className="card-text">See views and engagement metrics for each post to measure performance.</p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card feature-card h-100">
              <div className="card-body">
                <h5 className="card-title">Personal Dashboard</h5>
                <p className="card-text">A personal dashboard showing drafts, statistics, comments, and quick actions.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
