import React, { useEffect, useState } from 'react';
import './DonorWel.css';
import axios from 'axios';
import { donorApi } from '../../apiurl';

function DonorWel() {
  const name = localStorage.getItem('name') || 'Donor';
  const bloodGroup = localStorage.getItem('bloodGroup') || 'N/A';
  const city = localStorage.getItem('city') || 'N/A';
  const mobile = localStorage.getItem('mobile') || 'N/A';
  const email = localStorage.getItem('email') || '';

  const [currentId, setCurrentId] = useState(null);
  const [available, setAvailable] = useState(false);
  const [eligible, setEligible] = useState(false);
  const [reportUrl, setReportUrl] = useState('');
  const [reportFile, setReportFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [nearbyHospitals, setNearbyHospitals] = useState([]);

  // Fetch donor details
  useEffect(() => {
    if (!email) return;
    axios
      .get(`${donorApi}fetch?email=${email}`)
      .then((res) => {
        if (res.data.length > 0) {
          const donor = res.data[0];
          setCurrentId(donor._id);
          setAvailable(donor.available);
          setEligible(donor.eligible);
          setReportUrl(donor.reportUrl || '');
        }
      })
      .catch((err) => console.error('Error fetching donor details', err));
  }, [email]);

  // Fetch nearby hospitals based on donor city
  useEffect(() => {
    if (city) {
      axios
        .get(`${donorApi}nearby-hospitals/${city}`)
        .then((res) => setNearbyHospitals(res.data))
        .catch((err) => console.error('Error fetching nearby hospitals', err));
    }
  }, [city]);

  // Toggle availability
  const handleToggleAvailability = () => {
    const newStatus = !available;
    axios
      .patch(donorApi + 'update', {
        condition_obj: { email },
        content_obj: { available: newStatus },
      })
      .then(() => setAvailable(newStatus))
      .catch(() => alert('Failed to update availability'));
  };

  // Handle report upload
  const handleReportChange = (e) => setReportFile(e.target.files[0]);

  const handleUploadReport = () => {
    if (!reportFile) return alert('Select a report file first');
    if (!currentId) return alert('User identity not found. Please refresh.');

    const formData = new FormData();
    formData.append('report', reportFile);

    axios
      .post(`${donorApi}upload-report/${currentId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then(() => {
        setUploadStatus('Report uploaded successfully. Wait for admin verification.');
        setReportFile(null); // Clear file
      })
      .catch((err) => {
        console.error('Upload error:', err);
        setUploadStatus('Failed to upload report.');
      });
  };

  return (
    <div className="donor-dashboard">
      <div className="welcome-box">
        <h2>Welcome, {name}!</h2>
        <p className="small-text">Thanks for supporting the life-saving mission.</p>
      </div>

      <div className="dashboard-cards">
        {/* Donor Details */}
        <div className="card-block info-card">
          <h5>🧾 Your Profile</h5>
          <div className="info-list">
            <p><strong>City:</strong> {city}</p>
            <p><strong>Mobile:</strong> {mobile}</p>
            <p><strong>Role:</strong> Blood Donor</p>
            <p><strong>Blood Group:</strong> <span className="blood-badge">{bloodGroup}</span></p>
          </div>
        </div>

        {/* Eligibility Status */}
        <div className={`card-block eligibility-card ${eligible ? 'eligible' : 'pending'}`}>
          <h5>✅ Verification Process</h5>
          <div className="verification-steps">
            <div className="step-item completed">
              <i className="bi bi-check-circle-fill"></i>
              <span>Account Registered</span>
            </div>
            <div className={`step-item ${reportUrl ? 'completed' : 'active'}`}>
              <i className={reportUrl ? "bi bi-check-circle-fill" : "bi bi-circle"}></i>
              <span>Report Uploaded</span>
            </div>
            <div className={`step-item ${eligible ? 'completed' : (reportUrl ? 'active' : 'waiting')}`}>
              <i className={eligible ? "bi bi-check-circle-fill" : (reportUrl ? "bi bi-clock-history" : "bi bi-circle")}></i>
              <span>Admin Verified</span>
            </div>
          </div>
          <div className="status-banner">
            {eligible ? (
              <span className="badge-verified">Verified Donor</span>
            ) : (
              <span className="badge-pending">Pending Verification</span>
            )}
          </div>
        </div>

        {/* Availability Toggle */}
        <div className="card-block availability-card">
          <h5>📶 Availability</h5>
          <p>Current Status: <span className={`status-text ${available ? 'available' : 'unavailable'}`}>{available ? 'Available' : 'Not Available'}</span></p>
          <button className="btn-toggle" onClick={handleToggleAvailability}>
            {available ? 'Set as Unavailable' : 'Set as Available'}
          </button>
        </div>

        {/* Health Report Card */}
        <div className="card-block upload-card">
          <h5>📄 Health Report</h5>
          <p className="status-desc">
            {eligible 
              ? 'Your current report is verified. You can upload a new one to keep it updated.' 
              : 'Please upload your latest medical report for verification.'}
          </p>
          <div className="file-input-wrapper">
            <input type="file" accept="image/*,application/pdf" onChange={handleReportChange} />
          </div>
          <button className="btn-upload" onClick={handleUploadReport}>
            {eligible ? 'Update Report' : 'Submit Report'}
          </button>
          {uploadStatus && <p className="upload-msg">{uploadStatus}</p>}
        </div>

        {/* Nearby Hospitals (suggest only if not eligible) */}
        {!eligible && nearbyHospitals.length > 0 && (
          <div className="card-block hospital-card">
            <h5>🏥 Suggested Checkup Centers</h5>
            <div className="scroll-list">
              <ul>
                {nearbyHospitals.map((h) => (
                  <li key={h._id}>
                    <strong>{h.name}</strong>
                    <span>{h.address} • {h.contactNumber}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DonorWel;
