import { Link } from "react-router-dom";

function Signup() {
  const onSubmit = (ev) => {
    ev.preventDefault();
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card shadow p-4" style={{ width: "400px" }}>
        <h2 className="text-center mb-4">Create an Account</h2>

        <form onSubmit={onSubmit}>
          <div className="mb-3">
            <input type="text" className="form-control" placeholder="Full Name" />
          </div>

          <div className="mb-3">
            <input type="email" className="form-control" placeholder="Email Address" />
          </div>

          <div className="mb-3">
            <input type="password" className="form-control" placeholder="Password" />
          </div>

          <div className="mb-3">
            <input
              type="password"
              className="form-control"
              placeholder="Password Confirmation"
            />
          </div>

          <button className="btn btn-success w-100">Signup</button>

          <p className="text-center mt-3">
            Already Registered? <Link to="/login">Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Signup;
