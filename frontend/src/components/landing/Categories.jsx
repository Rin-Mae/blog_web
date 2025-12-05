import React from 'react';

export default function Categories() {
  return (
    <section id="categories" className="py-5">
      <div className="container">
        <h2 className="mb-4">Categories / Tags Showcase</h2>
        <div className="d-flex flex-wrap gap-2">
          <span className="badge bg-secondary p-2">Technology</span>
          <span className="badge bg-secondary p-2">Design</span>
          <span className="badge bg-secondary p-2">Business</span>
          <span className="badge bg-secondary p-2">Lifestyle</span>
        </div>
      </div>
    </section>
  );
}
