import React,{useState} from 'react';
import { useNavigate, Link } from "react-router-dom";
import logo from '../assets/riya-logo.png'
import axios from 'axios';
import api from '../api/axiosInstance';
import Validation  from './LoginValidation';

const Login = () => {
   const [errors, setErrors] = useState({})
  const [serverMessage, setServerMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const navigate = useNavigate();
 const[values, setValues] = useState({
    email:'',
    password:''
  })
  const handleInput = (event) => {
     setValues(prev => ({...prev, [event.target.name]:event.target.value}));
  }
  const handleSubmit = (e) => {
    e.preventDefault();
    const ValidationResult = Validation(values);
    setErrors(ValidationResult);
    if (Object.values(ValidationResult).every(v => v === '')) {
      setServerMessage(' ');
      setIsSuccess(false);

      api.post('/riya_dmclead/login', values)
        .then(res => {
          const msg = res?.data?.message || 'Logged in successfully';
           localStorage.setItem("riya_user", JSON.stringify(res.data));
          setServerMessage(msg);
          setIsSuccess(true);
          
          //clear form
          setValues({ email: '', password: '' });
          // on successful login, navigate to dashboard
          console.log('Logged in successfully');
          setTimeout(() => navigate('/dashboard'),500);
        })
        .catch(err => {
          const msg = err?.response?.data?.error || err.message || 'Server error';
          setServerMessage(msg);
          setIsSuccess(false);
        });

    };



    // navigate("/dashboard");
  };

  return (
    <>
      
   
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

            {/* <p className="text-center mt-3">
                Don't have an account? <Link to="/signup">Signup</Link>
            </p> */}
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
