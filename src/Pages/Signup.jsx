import React,{useState} from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';


const Signup = () => {
    const[name, setName] =useState("");
    const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleSignup = (e) => {
    e.preventDefault();

    //const userData = { name, email, password };
    // localStorage.setItem("riya_user", JSON.stringify(userData));

    alert("Signup Successful!");
    navigate("/");
  };
  return (
    <div className="loginbg">
       <div className="d-flex justify-content-center align-items-center vh-100  ">
        <div>
                  <div className='d-flex  justify-content-center pb-3'>
                  <img src={logo} alt="Logo" className='img-fluid' style={{maxHeight: '100px'}} />
                </div>
      <div className="logincard p-4" style={{ width: "350px" }}>
        <h3 className="text-center mb-3">Signup</h3>

        <form onSubmit={handleSignup}>
            <div className="mb-3">
            <label>Name</label>
            <input
              type="text"
              className="form-control"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label>Email</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label>Password</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button className="btn btn-submit w-100">Signup</button>
        </form>

        <p className="text-center mt-3">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
      </div>
    </div>
    </div>
  )
}

export default Signup
