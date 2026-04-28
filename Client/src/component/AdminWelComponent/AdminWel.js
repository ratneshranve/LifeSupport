import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './AdminWel.css';

function AdminWel() {
  const [adminName, setAdminName] = useState('Admin');
  const [queries, setQueries] = useState([]);
  const [donorsCount, setDonorsCount] = useState(0);
  const [hospitalsCount, setHospitalsCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    setAdminName(localStorage.getItem('name') || 'Admin');

    // Fetch contact queries
    axios.get('http://localhost:3001/contact/fetch')
      .then(res => setQueries(res.data))
      .catch(() => setQueries([]));

    // Fetch donors
    axios.get('http://localhost:3001/donor/fetch-all')
      .then(res => {
        const nonAdminDonors = res.data.filter(donor => donor.role === 'donor');
        setDonorsCount(nonAdminDonors.length);
      })
      .catch(() => setDonorsCount(0));

    // Fetch hospitals
    axios.get('http://localhost:3001/hospital/fetch')
      .then(res => setHospitalsCount(res.data.length))
      .catch(() => setHospitalsCount(0));
  }, []);

  return (
    <div className="admin-dashboard container py-5">
      <div className="welcome-box">
        <h2>Welcome, {adminName}!</h2>
        <p className="small-text">Here is an overview of recent activity.</p>
      </div>

      <div className="dashboard-cards row mb-5">
        <div className="col-md-3">
          <div className="card stat-card">
            <h5>📥 Contact Queries</h5>
            <h2>{queries.length}</h2>
            <p className="text-muted">Total Messages</p>
            <button
              className="btn btn-outline-dark btn-sm mt-2"
              onClick={() => navigate('/queries')}
            >
              View Queries
            </button>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card stat-card">
            <h5>👥 Total Donors</h5>
            <h2>{donorsCount}</h2>
            <p className="text-muted">Registered Donors</p>
            <button
              className="btn btn-outline-dark btn-sm mt-2"
              onClick={() => navigate('/managedonors')}
            >
              Manage Donors
            </button>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card stat-card">
            <h5>🏥 Total Hospitals</h5>
            <h2>{hospitalsCount}</h2>
            <p className="text-muted">Registered Hospitals</p>
            <button
              className="btn btn-outline-dark btn-sm mt-2"
              onClick={() => navigate('/managehospitals')}
            >
              Manage Hospitals
            </button>
          </div>
        </div>

        
      </div>
    </div>
  );
}

export default AdminWel;
