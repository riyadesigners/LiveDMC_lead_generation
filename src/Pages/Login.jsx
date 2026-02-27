import React,{useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from "react-router-dom";
import logo from '../assets/riya-logo.png'
import axios from 'axios';
import api from '../api/axiosInstance';
import Validation  from './LoginValidation';
import CryptoJS from 'crypto-js';
import { ms } from 'date-fns/locale';
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
        {/* Colored top bar */}
        <div
          style={{
            height: '4px',
            background: isSuccess
              ? 'linear-gradient(90deg, #28a745, #20c997)'
              : 'linear-gradient(90deg, #dc3545, #e83e5a)',
          }}
        />

        <div className="toast-header border-0" style={{ backgroundColor: isSuccess ? '#f0fff4' : '#fff5f5' }}>
          {/* Icon */}
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
            {isSuccess ? '✓' : '✕'}
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
   const [errors, setErrors] = useState({})
    const [toast, setToast] = useState({ show: false, message: '', isSuccess: false });
  const [serverMessage, setServerMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const navigate = useNavigate();

  const showToast = (message, isSuccess) => {
    setToast({show:true, message, isSuccess});
  }
  const closeToast = () => {
    setToast(prev => ({...prev, show:false}));
  }
 const[values, setValues] = useState({
    email:'',
    password:''
  })
  const handleInput = (event) => {
     setValues(prev => ({...prev, [event.target.name]:event.target.value}));
  }
 const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const res = await api.post("/riya_dmclead/login", {
      email: values.email,
      password: values.password,
    });

     
    localStorage.setItem("riya_user", JSON.stringify({
      username: res.data.username,
      role: res.data.role,
    }));

    showToast("Login Successful!", true);
    setTimeout(() => navigate("/dashboard"), 1000);

  } catch (err) {
    const message = err.response?.data?.error || "Login failed. Try again.";
    showToast(message, false);   
  }
};
  return (
    <>
      <Toast
        message={toast.message}
        isSuccess={toast.isSuccess}
        show={toast.show}
        onClose={closeToast}
      />
   
     <div className="signup-page">
        <img src={logo} alt="Logo" className='img-fluid' style={{  position: 'absolute', top: '0px',margin: '0 auto'}} />
      <div className="signup-container">

        {/* LEFT CARD */}
        <div className="signup-card">
           <div className="  p-4 logincard"  >
            <h3 className="text-center ">Login</h3>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label htmlFor='email' className='text-left'>Email</label>
                   <input type='email'  name='email'
            value={values.email}
            onChange={handleInput}
            className='form-control ' />
                    {errors.email && <span className='text-danger'>{errors.email}</span>}
                </div>
                <div className="mb-4">
                    <label>Password</label>
                    <input type='password'   name='password'
        value={values.password}
        onChange={handleInput}  className='form-control '/>
                    {errors.password && <span className='text-danger'>{errors.password}</span>}
                </div>
                <button className="btn btn-submit  w-100" type="submit">
                    Login
                </button>
            </form>

            <p className="text-center mt-3">
                Don't have an account? <Link to="/signup">Signup</Link>
            </p>
        </div>
        </div>

        {/* RIGHT IMAGE */}
        <div className="signup-image"></div>

      </div>
    </div>
    </>
  )
}

export default Login
