import { useState, useEffect } from 'react';
import axios from 'axios';
import './Search.css';

function HospitalHome() {
  const [subtype, setSubtype] = useState('');
  const [location, setLocation] = useState(localStorage.getItem('city') || '');
  const [output, setOutput] = useState(null);
  const [donorDetail, setDonorDetail] = useState([]);

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const handleSearch = () => {
    if (!subtype) return setOutput('Please select blood group');
    if (!location) return setOutput('Location is required');

    const formattedLocation = location.charAt(0).toUpperCase() + location.slice(1).toLowerCase();
    setOutput(`Searching for blood group ${subtype} in ${formattedLocation}`);
    setDonorDetail([]);

    const url = `http://localhost:3001/donor/fetch?donorType=blood&city=${encodeURIComponent(formattedLocation)}&bloodGroup=${encodeURIComponent(subtype)}`;

    axios.get(url)
      .then((response) => {
        if (response.data.length === 0) {
          setOutput('No donors found');
          setDonorDetail([]);
        } else {
          setDonorDetail(response.data);
          setOutput(null);
        }
      })
      .catch((err) => {
        console.error("Search error:", err);
        setOutput('Error fetching donors');
        setDonorDetail([]);
      });
  };

  

  return (
    <div className="hospital-home container py-5">
     

      <div className="search-section mb-5">
        <h3>Search Blood Donors</h3>
        {output && <div className="alert alert-info">{output}</div>}

        <div className="row g-3">
          <div className="col-md-4">
            <label>Blood Group</label>
            <select
              className="form-control"
              value={subtype}
              onChange={(e) => setSubtype(e.target.value)}
            >
              <option value="">Select Blood Group</option>
              {bloodGroups.map((bg) => <option key={bg} value={bg}>{bg}</option>)}
            </select>
          </div>
          <div className="col-md-4">
            <label>City</label>
            <select
              className="form-control"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            >
              <option value="">Select City</option>
              {['Indore', 'Bhopal', 'Ujjain', 'Gwalior', 'Dewas'].map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
          <div className="col-md-4 d-flex align-items-end">
            <button className="btn btn-primary w-100" onClick={handleSearch}>Search</button>
          </div>
        </div>

        {donorDetail.length > 0 && (
          <div className="table-responsive mt-4">
            <table className="table table-bordered align-middle shadow-sm">
              <thead className="bg-light text-center">
                <tr>
                  <th>Reg ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Donor Type</th>
                  <th>Blood Group</th>
                  <th>Mobile</th>
                  <th>Address</th>
                  <th>City</th>
                  <th>Gender</th>
                  <th>Availability</th>
                </tr>
              </thead>
              <tbody className="text-center">
                {donorDetail.map((row, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{row.name}</td>
                    <td>{row.email}</td>
                    <td className="text-capitalize">{row.donorType}</td>
                    <td>{row.bloodGroup || '-'}</td>
                    <td>{row.mobile}</td>
                    <td>{row.address}</td>
                    <td>{row.city}</td>
                    <td>{row.gender}</td>
                    <td>
                      <span className={`badge ${row.available ? 'bg-success' : 'bg-secondary'}`}>
                        {row.available ? 'Available' : 'Unavailable'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="hospital-info">
        <h3>Hospital Information</h3>
        <p>Name: {localStorage.getItem('name')}</p>
        <p>Email: {localStorage.getItem('email')}</p>
        <p>Contact: {localStorage.getItem('mobile')}</p>
        <p>City: {localStorage.getItem('city')}</p>
        <p>Address: {localStorage.getItem('address')}</p>
      </div>
    </div>
  );
}

export default HospitalHome;
