import React from 'react';
import { Link } from 'react-router-dom';

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-5 bg-white">
      <div className="container">
        <h2 className="mb-4">How It Works</h2>
        <div className="row">
          <div className="col-md-4">
            <h4>1. Sign up</h4>
            <p>Register an account and create your profile.</p>
            <p>
              <Link to="/create-account" className="btn btn-cta">Create Account</Link>
            </p>
          </div>
          <div className="col-md-4">
            <h4>2. Create or Discover</h4>
            <p>Start writing or find content tailored to your interests.</p>
          </div>
          <div className="col-md-4">
            <h4>3. Engage & Share</h4>
            <p>Engage with the community and share your posts.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
