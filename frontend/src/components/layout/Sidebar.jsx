function Sidebar() {
  return (
    <div className="card shadow-sm border-0 rounded">

      <div className="card-body p-4">

        {/* Section Title */}
        <h5 className="fw-bold mb-4">Other Blogs</h5>
        
        <hr/>

        {/* Blog List */}
        <div className="d-flex flex-column gap-4">

          {/* Blog Item */}
          <a
            href="#"
            className="d-flex align-items-center text-decoration-none text-dark blog-item-hover"
          >
            <img
              src="https://placehold.co/100x80"
              alt="Related Blog"
              className="rounded me-3 shadow-sm"
              style={{ width: "95px", height: "70px", objectFit: "cover" }}
            />

            <div>
              <h6 className="fw-semibold mb-1" style={{ lineHeight: "1.2" }}>
                How to Improve Your React Coding Skills
              </h6>
              <small className="text-muted">Jan 10, 2025</small>
            </div>
          </a>

          {/* Blog Item */}
          <a
            href="#"
            className="d-flex align-items-center text-decoration-none text-dark blog-item-hover"
          >
            <img
              src="https://placehold.co/100x80"
              alt="Related Blog"
              className="rounded me-3 shadow-sm"
              style={{ width: "95px", height: "70px", objectFit: "cover" }}
            />

            <div>
              <h6 className="fw-semibold mb-1" style={{ lineHeight: "1.2" }}>
                Why Developers Should Start Blogging in 2025
              </h6>
              <small className="text-muted">Dec 22, 2024</small>
            </div>
          </a>

          {/* Blog Item */}
          <a
            href="#"
            className="d-flex align-items-center text-decoration-none text-dark blog-item-hover"
          >
            <img
              src="https://placehold.co/100x80"
              alt="Related Blog"
              className="rounded me-3 shadow-sm"
              style={{ width: "95px", height: "70px", objectFit: "cover" }}
            />

            <div>
              <h6 className="fw-semibold mb-1" style={{ lineHeight: "1.2" }}>
                Tips for Writing Clean and Modern JavaScript
              </h6>
              <small className="text-muted">Feb 1, 2025</small>
            </div>
          </a>

        </div>

      </div>

    </div>
  );
}

export default Sidebar;
