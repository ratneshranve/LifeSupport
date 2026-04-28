import './EpDonor.css';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { donorApi } from '../../apiurl';

function EpDonor() {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [gender, setGender] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [available, setAvailable] = useState(false);
  const [output, setOutput] = useState('');

  useEffect(() => {
    axios
      .get(`${donorApi}fetch?email=${localStorage.getItem("email")}`)
      .then((res) => {
        const donor = res.data[0];
        setName(donor.name || '');
        setEmail(donor.email || '');
        setMobile(donor.mobile || '');
        setAddress(donor.address || '');
        setCity(donor.city || '');
        setGender(donor.gender || '');
        setBloodGroup(donor.bloodGroup || '');
        setAvailable(donor.available || false);
      })
      .catch(() => setOutput("Failed to load donor profile"));
  }, []);

  const handleSubmit = () => {
    if (!name || !mobile || !address || !city || !gender || !bloodGroup) {
      return setOutput("All fields are required");
    }

    if (name.length < 3) {
      return setOutput("Name must be at least 3 characters long");
    }

    const mobileRegex = /^[0-9]{10}$/;
    if (!mobileRegex.test(mobile)) {
      return setOutput("Mobile number must be exactly 10 digits");
    }

    if (address.length < 10) {
      return setOutput("Address must be at least 10 characters long");
    }

    const updatedDonor = {
      condition_obj: { email },
      content_obj: {
        name,
        mobile,
        address,
        city,
        gender,
        donorType: "blood", // fixed type
        bloodGroup,
        available,
      },
    };

    axios
      .patch(`${donorApi}update`, updatedDonor)
      .then(() => {
        setOutput("Donor profile updated successfully");
        alert("Donor profile updated successfully");

        // ✅ Save to localStorage
        localStorage.setItem("name", name);
        localStorage.setItem("mobile", mobile);
        localStorage.setItem("address", address);
        localStorage.setItem("city", city);
        localStorage.setItem("gender", gender);
        localStorage.setItem("donorType", "blood");
        localStorage.setItem("bloodGroup", bloodGroup);
        localStorage.setItem("available", available);

        navigate("/donor");
      })
      .catch(() => setOutput("Profile update failed"));
  };

  return (
    <div className="epdonor-container">
      <h2 className="form-title">Edit Blood Donor Profile</h2>
      {output && <div className="output-msg">{output}</div>}

      <form className="epdonor-form">
        <label>Name:</label>
        <input type="text" value={name} onChange={e => setName(e.target.value)} />

        <label>Email (readonly):</label>
        <input type="email" value={email} readOnly />

        <label>Mobile:</label>
        <input type="text" value={mobile} onChange={e => setMobile(e.target.value)} />

        <label>Address:</label>
        <textarea value={address} onChange={e => setAddress(e.target.value)} />

        <label>City:</label>
        <select value={city} onChange={e => setCity(e.target.value)}>
          <option value="">Select City</option>
          <option>Indore</option>
          <option>Bhopal</option>
          <option>Ujjain</option>
          <option>Gwalior</option>
          <option>Dewas</option>
        </select>

        <label>Gender:</label>
        <div className="radio-group">
          <label>
            <input
              type="radio"
              name="gender"
              value="male"
              checked={gender === "male"}
              onChange={e => setGender(e.target.value)}
            />
            Male
          </label>
          <label>
            <input
              type="radio"
              name="gender"
              value="female"
              checked={gender === "female"}
              onChange={e => setGender(e.target.value)}
            />
            Female
          </label>
        </div>

        <label>Blood Group:</label>
        <select value={bloodGroup} onChange={e => setBloodGroup(e.target.value)}>
          <option value="">Select Blood Group</option>
          <option>O+</option>
          <option>O-</option>
          <option>A+</option>
          <option>A-</option>
          <option>B+</option>
          <option>B-</option>
          <option>AB+</option>
          <option>AB-</option>
        </select>

        <label>
          <input
            type="checkbox"
            checked={available}
            onChange={e => setAvailable(e.target.checked)}
          />
          Available for Blood Donation
        </label>

        <button type="button" onClick={handleSubmit}>Update Profile</button>
      </form>
    </div>
  );
}

export default EpDonor;
