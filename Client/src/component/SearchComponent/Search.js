import { useState } from 'react';
import './Search.css';
import axios from 'axios';

function Search() {
  const [subtype, setSubtype] = useState('');
  const [location, setLocation] = useState('');
  const [output, setOutput] = useState(null);
  const [donorDetail, setDonorDetail] = useState([]);
  const [nearbyHospitals, setNearbyHospitals] = useState([]);

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const handleSubmit = () => {
    if (!subtype) return setOutput('Please select blood group');
    if (!location) return setOutput('Location is required');

    const formattedLocation = location.charAt(0).toUpperCase() + location.slice(1).toLowerCase();
    setOutput(`Searching for blood group ${subtype} in ${formattedLocation}`);
    setDonorDetail([]);
    setNearbyHospitals([]);

    const donorUrl = `http://localhost:3001/donor/fetch?city=${encodeURIComponent(formattedLocation)}&bloodGroup=${encodeURIComponent(subtype)}&eligible=true`;
    const hospitalUrl = `http://localhost:3001/hospital/fetch?city=${encodeURIComponent(formattedLocation)}`;

    // Fetch donors
    axios.get(donorUrl)
      .then((response) => {
        if (response.data.length === 0) {
          setOutput('No donors found');
          setDonorDetail([]);
        } else {
          setDonorDetail(response.data);
          setOutput(null);
        }
      })
      .catch(() => {
        setOutput('No donors found');
        setDonorDetail([]);
      });

    // Fetch nearby hospitals
    axios.get(hospitalUrl)
      .then((response) => {
        setNearbyHospitals(response.data || []);
      })
      .catch(() => {
        setNearbyHospitals([]);
      });
  };

  return (
    <div className="search-container container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-6 col-md-8 col-sm-10">
          <div className="form-card bg-white p-4 shadow rounded">
            {output && <div className="alert alert-info">{output}</div>}
            <h2 className="mb-4 text-center">Search for Blood Donors</h2>

            <form>
              <div className="mb-3">
                <label>Blood Group</label>
                <select
                  className="form-control"
                  value={subtype}
                  onChange={(e) => setSubtype(e.target.value)}
                >
                  <option value="">Select Blood Group</option>
                  {bloodGroups.map((bg) => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label>Location</label>
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

              <button
                type="button"
                className="btn btn-brownish-red w-100"
                onClick={handleSubmit}
              >
                Search
              </button>
            </form>
          </div>

          <div className="section-title text-start my-5">
            <h1 className="display-5 mb-4 text-primary">See Donor Details</h1>

            {donorDetail.length === 0 ? (
              <div className="text-center text-muted my-4">No matching donors found.</div>
            ) : (
              <div className="table-responsive">
                <table className="table table-bordered align-middle shadow-sm">
                  <thead className="bg-light text-center">
                    <tr>
                      <th>Serial No.</th>
                      <th>Name</th>
                      <th>City</th>
                      <th>Contact</th>
                      <th>Email</th>
                      <th>Blood Group</th>
                      <th>Availability</th>
                      <th>Gender</th>
                      <th>Address</th>
                    </tr>
                  </thead>
                  <tbody className="text-center">
                    {donorDetail.map((row, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{row.name}</td>
                        <td>{row.city}</td>
                        <td>{row.mobile}</td>
                        <td>{row.email}</td>
                        <td>{row.bloodGroup || '-'}</td>
                        <td>
                          <span className={`badge ${row.available ? 'bg-success' : 'bg-secondary'}`}>
                            {row.available ? 'Available' : 'Unavailable'}
                          </span>
                        </td>
                        <td>{row.gender}</td>
                        <td>{row.address}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Nearby Hospitals */}
            {nearbyHospitals.length > 0 && (
              <div className="mt-5">
                <h4 className="mb-3 text-danger">Nearby Hospitals in {location}</h4>
                <ul className="list-group">
                  {nearbyHospitals.slice(0, 2).map((hospital, idx) => (
                    <li key={hospital._id || idx} className="list-group-item">
                      <strong>{hospital.name}</strong> - {hospital.address} <br />
                      <span>Contact: {hospital.contactNumber}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Search;
