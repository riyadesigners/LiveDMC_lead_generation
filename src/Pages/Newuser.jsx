import React, {useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';

const Toast = ({message, isSuccess, show, onClose}) => {
  useEffect(()=> {
    if(show){
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
            {isSuccess ? '✓' : '✕'}
          </span>
          <strong className={`mr-auto ${isSuccess ? 'text-success' : 'text-danger'}`}>
            {isSuccess ? 'Success' : 'Error'}
          </strong>
          <small className="text-muted">Just now</small>
          <button type="button" className="ml-2 mb-1 close" onClick={onClose} style={{ fontSize: '1rem' }}>
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
const Newuser = () => {
  const Navigate = useNavigate();
const [toast, setToast] = useState({ show: false, message: '', isSuccess: false });
  const [loading, setLoading] = useState(false);
  const [values, setValues] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user',
  });
  const [errors, setErrors] = useState({});
  const showToast = (message, isSuccess) => setToast({ show:true, message, isSuccess});
  const closeToast = () => setToast(prev => ({...prev, show:false}));
  const handleInput = (e) => {
    setValues(prev => ({...prev, [e.target.name]: e.target.value }));
    if(errors[e.target.name]){
      setErrors(prev => ({...prev, [e.target.name]: ''}));
    }
  };
  const validate = () => {
    const newErrors = {};
    if (!values.username.trim()) newErrors.username = 'Username is required';
    if (!values.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) newErrors.email = 'Invalid email format';
    if (!values.password) newErrors.password = 'Password is required';
    else if (values.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (!values.confirmPassword) newErrors.confirmPassword = 'Please confirm password';
    else if (values.password !== values.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (!values.role) newErrors.role = 'Role is required';
    return newErrors;
  };
const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/riya_dmclead/add-user', {
        username: values.username.trim(),
        email: values.email.trim(),
        password: values.password,
        role: values.role,
      });

      showToast(res.data.message || 'User added successfully!', true);
       setTimeout(() => Navigate("/login"), 1000);
      setValues({ username: '', email: '', password: '', confirmPassword: '', role: 'user' });
      setErrors({});
    } catch (err) {
      const message = err.response?.data?.error || 'Failed to add user. Try again.';
      showToast(message, false);
    } finally {
      setLoading(false);
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

      {/* <div className="signup-page">*/}
        <div className="usercontainer"> 
          <div className="signup-card" style={{ left:'54% !important' }}>
            <div className="p-4 logincard">
              <h3 className="text-center mb-4">Add New User</h3>
              <form onSubmit={handleSubmit}>

                {/* Username */}
                <div className="mb-3">
                  <label htmlFor="username">Username</label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={values.username}
                    onChange={handleInput}
                    className={`form-control ${errors.username ? 'is-invalid' : ''}`}
                    placeholder="Enter username"
                    maxLength={30}
                  />
                  {errors.username && <div className="invalid-feedback">{errors.username}</div>}
                </div>

                {/* Email */}
                <div className="mb-3">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={values.email}
                    onChange={handleInput}
                    className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                    placeholder="Enter email"
                    maxLength={30}
                  />
                  {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                </div>

                {/* Role */}
                <div className="mb-3">
                  <label htmlFor="role">Role</label>
                  <select
                    id="role"
                    name="role"
                    value={values.role}
                    onChange={handleInput}
                    className={`form-select ${errors.role ? 'is-invalid' : ''}`}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                    <option value="superadmin">Super Admin</option>
                  </select>
                  {errors.role && <div className="invalid-feedback">{errors.role}</div>}
                </div>

                {/* Password */}
                <div className="mb-3">
                  <label htmlFor="password">Password</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={values.password}
                    onChange={handleInput}
                    className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                    placeholder="Enter password"
                  />
                  {errors.password && <div className="invalid-feedback">{errors.password}</div>}
                </div>

                {/* Confirm Password */}
                <div className="mb-4">
                  <label htmlFor="confirmPassword">Confirm Password</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={values.confirmPassword}
                    onChange={handleInput}
                    className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                    placeholder="Re-enter password"
                  />
                  {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword}</div>}
                </div>

                <button
                  className="btn btn-submit w-100"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? 'Adding User...' : 'Add User'}
                </button>

                <button
                  type="button"
                  className="btn btn-outline-secondary w-100 mt-2"
                  onClick={() => Navigate('/login')}
                >
                  Cancel
                </button>
              </form>
            </div>
          </div>

          {/* <div className="signup-image"></div> */}
      </div>
        {/* </div> */}
    </>
  );
};

export default Newuser;