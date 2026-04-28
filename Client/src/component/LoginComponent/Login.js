import './Login.css';
import { useState } from 'react';
import axios from 'axios';
import { donorApi, hospitalApi } from '../../apiurl'; // make sure hospitalApi is defined
import { useNavigate } from 'react-router-dom';

function Login() {
  const navigate = useNavigate();
  const [output, setOutput] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('donor'); // add role selector

  const handleSubmit = () => {
    if (!email || !password) {
      return setOutput('Please enter both email and password.');
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return setOutput('Please enter a valid email address.');
    }

    const userDetail = { email, password };

    // Choose API endpoint based on role
    const api = role === 'donor' ? donorApi + 'login' : hospitalApi + 'login';

    axios
      .post(api, userDetail)
      .then((response) => {
        const userDetail = response.data.donorList || response.data.hospitalList;
        if (!userDetail) throw new Error('Login failed');

        // Save details in localStorage
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('_id', userDetail._id);
        localStorage.setItem('name', userDetail.name);
        localStorage.setItem('email', userDetail.email);
        localStorage.setItem('password', userDetail.password);
        localStorage.setItem('mobile', userDetail.mobile || userDetail.contactNumber || '');
        localStorage.setItem('city', userDetail.city);
        localStorage.setItem('address', userDetail.address);
        localStorage.setItem('gender', userDetail.gender || '');
        localStorage.setItem('donorType', userDetail.donorType || '');
        localStorage.setItem('bloodGroup', userDetail.bloodGroup || '');
        localStorage.setItem('role', userDetail.role);
        localStorage.setItem('status', userDetail.status);
        localStorage.setItem('info', userDetail.info);

        // Navigate based on role
        if (userDetail.role === 'donor') navigate('/donor');
        else if (userDetail.role === 'hospital') navigate('/hospital'); // hospital home page
        else navigate('/admin');
      })
      .catch((err) => {
        console.error(err);
        setOutput('Login unsuccessful. Please check your credentials.');
        setEmail('');
        setPassword('');
      });
  };

  return (
    <div className="login-page">
      <div className="form-card">
        {output && <div className="alert alert-danger text-center">{output}</div>}
        <h2 className="text-center">Login</h2>

        {/* Role selector */}
        <div className="mb-3 text-center">
          <label className="me-2">Login as:</label>
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="donor">Donor</option>
            <option value="hospital">Hospital</option>
          </select>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
          <div className="mb-3">
            <label>Email</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="mb-3">
            <label>Password</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          <div className="d-grid mb-3">
            <button type="submit" className="btn btn-danger">
              Login
            </button>
          </div>

          <div className="text-center">
            <p>
              Not registered?{' '}
              <button type="button" className="btn btn-link" onClick={() => navigate('/register')}>
                Register Here
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
