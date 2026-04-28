import './DonorRegister.css';
import { useState } from 'react';
import axios from 'axios';

function DonorRegister() {
  const [output, setOutput] = useState(null);
  const [donorForm, setDonorForm] = useState({
    name: '',
    email: '',
    password: '',
    mobile: '',
    address: '',
    city: '',
    gender: '',
    bloodGroup: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDonorForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      const { name, email, password, mobile, address, city, gender, bloodGroup } = donorForm;

      if (!name) return setOutput('Name is required.');
      if (!email) return setOutput('Email is required.');
      if (!password) return setOutput('Password is required.');
      if (!mobile) return setOutput('Mobile number is required.');
      if (!address) return setOutput('Address is required.');
      if (!city) return setOutput('Please select a city.');
      if (!gender) return setOutput('Please select your gender.');
      if (!bloodGroup) return setOutput('Please select your blood group.');

      // Name validation
      if (name.length < 3) {
        return setOutput('Name must be at least 3 characters long.');
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return setOutput('Please enter a valid email address.');
      }

      // Password validation (matching mongoose schema: 5-10 chars)
      if (password.length < 5 || password.length > 10) {
        return setOutput('Password must be between 5 and 10 characters.');
      }

      // Mobile validation (10 digits)
      const mobileRegex = /^[0-9]{10}$/;
      if (!mobileRegex.test(mobile)) {
        return setOutput('Mobile number must be exactly 10 digits.');
      }

      // Address validation
      if (address.length < 10) {
        return setOutput('Address should be at least 10 characters long for better location accuracy.');
      }

      const res = await axios.post('http://localhost:3001/donor/register', {
        ...donorForm,
        donorType: 'blood',
        available: false, // set default true silently
      });

      if (res.status === 201) {
        setOutput('Registration successful! Please login and upload your health report for verification.');
        setDonorForm({
          name: '',
          email: '',
          password: '',
          mobile: '',
          address: '',
          city: '',
          gender: '',
          bloodGroup: '',
        });
      }
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.status || 'Registration failed. Please try again later.';
      setOutput(errorMsg);
    }
  };

  return (
    <div className="register-container container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8 col-md-10">
          <div className="form-card bg-white p-4 shadow rounded">
            <h2 className="mb-4 text-center">Donor Registration</h2>
            {output && <div className="alert alert-info">{output}</div>}

            <div className="row">
              <div className="col-md-6 mb-3">
                <label>Name</label>
                <input
                  className="form-control"
                  name="name"
                  value={donorForm.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-6 mb-3">
                <label>Email</label>
                <input
                  className="form-control"
                  type="email"
                  name="email"
                  value={donorForm.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-6 mb-3">
                <label>Password</label>
                <input
                  className="form-control"
                  type="password"
                  name="password"
                  value={donorForm.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-6 mb-3">
                <label>Mobile</label>
                <input
                  className="form-control"
                  name="mobile"
                  value={donorForm.mobile}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-12 mb-3">
                <label>Address</label>
                <textarea
                  className="form-control"
                  name="address"
                  value={donorForm.address}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-6 mb-3">
                <label>City</label>
                <select
                  className="form-control"
                  name="city"
                  value={donorForm.city}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select City</option>
                  <option>Indore</option>
                  <option>Bhopal</option>
                  <option>Ujjain</option>
                  <option>Gwalior</option>
                  <option>Dewas</option>
                </select>
              </div>

              <div className="col-md-6 mb-3">
                <label>Gender</label>
                <div className="d-flex gap-3">
                  {['M', 'F', 'Other'].map((g) => (
                    <label key={g}>
                      <input
                        type="radio"
                        name="gender"
                        value={g}
                        checked={donorForm.gender === g}
                        onChange={handleChange}
                        required
                      />{' '}
                      {g}
                    </label>
                  ))}
                </div>
              </div>

              <div className="col-md-6 mb-3">
                <label>Blood Group</label>
                <select
                  className="form-control"
                  name="bloodGroup"
                  value={donorForm.bloodGroup}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Blood Group</option>
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                    <option key={bg}>{bg}</option>
                  ))}
                </select>
              </div>
            </div>

            <button className="btn btn-brownish-red w-100 mt-3" onClick={handleSubmit}>
              Register
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DonorRegister;
