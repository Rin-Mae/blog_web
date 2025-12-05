import React from 'react';
import { Link } from 'react-router-dom';

export default function ChooseYourPath() {
  return (
    <section id="choose-your-path" className="py-5">
      <div className="container">
        <h2 className="mb-4 text-center">Choose Your Path</h2>
        <p className="text-center mb-4">Discover great reads or start publishing your own.</p>
        <div className="row g-4">
          <div className="col-md-6">
            <div className="card audience-card h-100">
              <div className="card-body d-flex flex-column">
                <h3 className="card-title">Reader</h3>
                <p className="card-text">Discover curated content, follow topics you love, and get personalized recommendations.</p>
                <div className="mt-auto">
                  <Link to="/blogs" className="btn btn-cta">Browse Blogs</Link>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card audience-card h-100">
              <div className="card-body d-flex flex-column">
                <h3 className="card-title">Blogger</h3>
                <p className="card-text">Create, publish, and grow your audience with easy tools and monetization options.</p>
                <div className="mt-auto">
                  <a href="#how-it-works" className="btn btn-cta">Create Blog</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
