import { Link } from "react-router-dom";

function Login() {
  const onSubmit = (ev) => {
    ev.preventDefault();
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="card shadow p-4" style={{ width: "400px" }}>
        <h2 className="text-center mb-4">Login to an Account</h2>

        <form onSubmit={onSubmit}>
          <div className="mb-3">
            <input type="email" className="form-control" placeholder="Email" />
          </div>

          <div className="mb-3">
            <input type="password" className="form-control" placeholder="Password" />
          </div>

          <button className="btn btn-primary w-100">Login</button>

          <p className="text-center mt-3">
            Not Registered? <Link to="/signup">Create an Account</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;
