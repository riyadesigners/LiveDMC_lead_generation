import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from "react-router-dom";
import logo from '../assets/riya-logo.png';
import api from '../api/axiosInstance';


const Toast = ({ message, isSuccess, show, onClose }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => onClose(), 3500);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 9999 }}
    >
      <div
        className={`toast ${show ? 'show' : ''}`}
        style={{
          minWidth: '280px',
          border: 'none',
          borderRadius: '8px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          overflow: 'hidden',
          transition: 'all 0.3s ease',
          opacity: show ? 1 : 0,
        }}
      >
        <div
          style={{
            height: '4px',
            background: isSuccess
              ? 'linear-gradient(90deg, #28a745, #20c997)'
              : 'linear-gradient(90deg, #dc3545, #e83e5a)',
          }}
        />

        <div className="toast-header border-0" style={{ backgroundColor: isSuccess ? '#f0fff4' : '#fff5f5' }}>
          <span
            className="rounded-circle d-inline-flex align-items-center justify-content-center mr-2"
            style={{
              width: '24px',
              height: '24px',
              backgroundColor: isSuccess ? '#28a745' : '#dc3545',
              color: '#fff',
              fontSize: '13px',
              flexShrink: 0,
            }}
          >
            {isSuccess ? 'OK' : 'X'}
          </span>

          <strong className={`mr-auto ${isSuccess ? 'text-success' : 'text-danger'}`}>
            {isSuccess ? 'Success' : 'Error'}
          </strong>

          <small className="text-muted">Just now</small>

          <button
            type="button"
            className="ml-2 mb-1 close"
            onClick={onClose}
            style={{ fontSize: '1rem' }}
          >
            <span aria-hidden="true">&times;</span>
          </button>
        </div>

        <div
          className="toast-body"
          style={{
            backgroundColor: isSuccess ? '#f0fff4' : '#fff5f5',
            color: isSuccess ? '#155724' : '#721c24',
            fontWeight: '500',
            fontSize: '0.9rem',
            paddingTop: '4px',
          }}
        >
          {message}
        </div>
      </div>
    </div>
  );
};

const Login = () => {
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState({ show: false, message: '', isSuccess: false });
  const navigate = useNavigate();

  const showToast = (message, isSuccess) => {
    setToast({ show: true, message, isSuccess });
  };

  const closeToast = () => {
    setToast(prev => ({ ...prev, show: false }));
  };

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const token = searchParams.get('token');

    if (!token) return;

    const loginWithToken = async () => {
      // alert("Login with token attempt: " + token); 
      try {
        const res = await api.post("/LoginWithJWTToken", {
            token
          }, {
            withCredentials: true
          });
        console.log("Role new:", res.data.role);
      //     const authRes = await api.get("/check-auth", {
      //    withCredentials: true
      //  });
        localStorage.setItem("riya_user", JSON.stringify({
           username: res.data.username,
            role: res.data.role,
            user_id: res.data.user_id,
        }));
        console.log("Auth check response:", res.data.role);
        showToast("Login Successful!", true);
        setTimeout(() => navigate("/dashboard"), 1000);
      } catch (err) {
        const message = err.response?.data?.error || "Login failed. Try again.";
        showToast(message, false);
      }
    };

    if (process.env.NODE_ENV === "production") {
      loginWithToken();
    }

  }, [navigate]);

  const [values, setValues] = useState({
    email: '',
    password: '',
  });

  const handleInput = (event) => {
    setValues(prev => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!values.email.trim()) newErrors.email = 'Email is required';
    if (!values.password) newErrors.password = 'Password is required';
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});

    try {
      const res = await api.post("/login", {
        withCredentials: true,
        email: values.email,
        password: values.password,
        role: values.role,
      });
console.log("Role:", res.data.role);
      //  const authRes = await api.get("/check-auth", {
      //    withCredentials: true
      //  });

      localStorage.setItem("riya_user", JSON.stringify({
        username: res.data.username,
        role: res.data.role,
        user_id: res.data.user_id,
      }));
      
      showToast("Login Successful!", true);
      console.log("Auth check response:", res.data.role);
      setTimeout(() => navigate("/dashboard"), 1000);
    } catch (err) {
      const message = err.response?.data?.error || "Login failed. Try again.";
      showToast(message, false);
    }
  };

  if (process.env.NODE_ENV === "production") {

    return;
  }

  return (
    <>
      <Toast
        message={toast.message}
        isSuccess={toast.isSuccess}
        show={toast.show}
        onClose={closeToast}
      />

      <div className="signup-page">
        <img
          src={logo}
          alt="Logo"
          className="img-fluid"
          style={{ position: 'absolute', top: '0px', margin: '0 auto' }}
        />
        <div className="signup-container">
          <div className="signup-card">
            <div className="p-4 logincard">
              <h3 className="text-center">Login</h3>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="email" className="text-left">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={values.email}
                    onChange={handleInput}
                    className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                    placeholder="Enter your email"
                  />
                  {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                </div>

                <div className="mb-4">
                  <label htmlFor="password">Password</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={values.password}
                    onChange={handleInput}
                    className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                    placeholder="Enter your password"
                  />
                  {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                </div>

                <button className="btn btn-submit w-100" type="submit">
                  Login
                </button>
              </form>

              <p className="text-center mt-3">
                Don't have an account? <Link to="/signup">Signup</Link>
              </p>
            </div>
          </div>

          <div className="signup-image"></div>
        </div>
      </div>
    </>
  );
};

export default Login;
