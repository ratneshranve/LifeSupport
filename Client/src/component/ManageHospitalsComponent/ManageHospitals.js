import './ManageHospitals.css';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { hospitalApi } from '../../apiurl';

function ManageHospitals() {
  const [hospitals, setHospitals] = useState([]);
  const [filteredHospitals, setFilteredHospitals] = useState([]);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const hospitalsPerPage = 5;

  // Add Hospital Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newHospital, setNewHospital] = useState({
    name: '',
    email: '',
    password: '',
    contactNumber: '',
    address: '',
    city: ''
  });

  useEffect(() => {
    fetchHospitals();
  }, []);

  useEffect(() => {
    applySearchSort();
  }, [search, hospitals, sortBy]);

  const fetchHospitals = () => {
    axios.get(hospitalApi + 'fetch')
      .then(res => {
        setHospitals(res.data);
        setError('');
      })
      .catch(() => setError('Failed to fetch hospitals'));
  };

  const applySearchSort = () => {
    let filtered = [...hospitals];
    if (search) {
      const term = search.toLowerCase();
      filtered = filtered.filter(h =>
        h.name?.toLowerCase().includes(term) ||
        h.email?.toLowerCase().includes(term) ||
        h.city?.toLowerCase().includes(term)
      );
    }
    if (sortBy === 'city') {
      filtered.sort((a, b) => a.city.localeCompare(b.city));
    }
    setFilteredHospitals(filtered);
    setCurrentPage(1);
  };

  const changeStatus = (_id, action) => {
    const update = (statusMsg, statusCode) => {
      axios.patch(hospitalApi + 'update', {
        condition_obj: { _id },
        content_obj: { status: statusCode }
      })
      .then(() => {
        alert(`Hospital ${statusMsg}`);
        fetchHospitals();
      })
      .catch(() => alert(`${statusMsg} failed`));
    };

    if (action === 'verify') update("verified", 1);
    else if (action === 'block') update("blocked", 0);
    else if (action === 'delete') {
      axios.delete(hospitalApi + "delete", { data: { _id } })
        .then(() => {
          alert("Hospital deleted");
          fetchHospitals();
        })
        .catch(() => alert("Deletion failed"));
    }
  };

  const handleAddHospital = () => {
    const { name, email, password, contactNumber, address, city } = newHospital;
    if (!name || !email || !password || !contactNumber || !address || !city) {
      return alert("Please fill all fields");
    }

    if (name.length < 3) {
      return alert("Name must be at least 3 characters long");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return alert("Please enter a valid email address");
    }

    if (password.length < 5 || password.length > 10) {
      return alert("Password must be between 5 and 10 characters");
    }

    const mobileRegex = /^[0-9]{10}$/;
    if (!mobileRegex.test(contactNumber)) {
      return alert("Contact number must be 10 digits");
    }

    axios.post(hospitalApi + 'register', newHospital)
      .then(() => {
        alert("Hospital added successfully");
        fetchHospitals();
        setShowAddModal(false);
        setNewHospital({ name: '', email: '', password: '', contactNumber: '', address: '', city: '' });
      })
      .catch(() => alert("Failed to add hospital"));
  };

  // Pagination
  const indexOfLast = currentPage * hospitalsPerPage;
  const indexOfFirst = indexOfLast - hospitalsPerPage;
  const currentHospitals = filteredHospitals.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredHospitals.length / hospitalsPerPage);

  return (
    <div className="manage-donors-container">
      <h1 className="manage-donors-title">Manage Hospitals</h1>

      {error && <div className="alert-error">{error}</div>}

      <div className="controls">
        <input
          type="text"
          placeholder="🔍 Search by name, email or city..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="">Sort by</option>
          <option value="city">City</option>
        </select>
        <button className="btn-add-hospital" onClick={() => setShowAddModal(true)}>
          <i className="bi bi-plus-circle-fill"></i> Add Hospital
        </button>
      </div>

      {/* Add Hospital Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="hospital-modal" onClick={e => e.stopPropagation()}>
            <div className="h-modal-header">
              <h2>Add New Hospital</h2>
              <button className="close-modal" onClick={() => setShowAddModal(false)}>&times;</button>
            </div>
            <div className="h-modal-body">
              <div className="input-group">
                <i className="bi bi-hospital"></i>
                <input placeholder="Hospital Name" value={newHospital.name} onChange={e => setNewHospital({ ...newHospital, name: e.target.value })} required/>
              </div>
              <div className="input-group">
                <i className="bi bi-envelope"></i>
                <input placeholder="Email Address" type="email" value={newHospital.email} onChange={e => setNewHospital({ ...newHospital, email: e.target.value })} required/>
              </div>
              <div className="input-group">
                <i className="bi bi-lock"></i>
                <input placeholder="Password" type="password" value={newHospital.password} onChange={e => setNewHospital({ ...newHospital, password: e.target.value })} required/>
              </div>
              <div className="input-group">
                <i className="bi bi-telephone"></i>
                <input placeholder="Contact Number" value={newHospital.contactNumber} onChange={e => setNewHospital({ ...newHospital, contactNumber: e.target.value })} required/>
              </div>
              <div className="input-group">
                <i className="bi bi-geo-alt"></i>
                <input placeholder="Full Address" value={newHospital.address} onChange={e => setNewHospital({ ...newHospital, address: e.target.value })} required/>
              </div>
              <div className="input-group">
                <i className="bi bi-building"></i>
                <input placeholder="City" value={newHospital.city} onChange={e => setNewHospital({ ...newHospital, city: e.target.value })} required/>
              </div>
            </div>
            <div className="h-modal-footer">
              <button className="btn-cancel" onClick={() => setShowAddModal(false)}>Cancel</button>
              <button className="btn-save" onClick={handleAddHospital}>Save Hospital</button>
            </div>
          </div>
        </div>
      )}

      <div className="table-container">
        <table className="manage-donors-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Email</th>
              <th>Contact</th>
              <th>City</th>
              <th>Address</th>
              <th>Registered</th>
              <th>Status</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {currentHospitals.length > 0 ? (
              currentHospitals.map((hospital, index) => (
                <tr key={hospital._id}>
                  <td>{indexOfFirst + index + 1}</td>
                  <td>{hospital.name}</td>
                  <td>{hospital.email}</td>
                  <td>{hospital.contactNumber}</td>
                  <td>{hospital.city}</td>
                  <td>{hospital.address}</td>
                  <td>{hospital.info ? new Date(hospital.info).toLocaleDateString() : '-'}</td>
                  <td>
                    {hospital.status === 0 ? (
                      <button className="btn-action green" title="Verify Hospital" onClick={() => changeStatus(hospital._id, 'verify')}>
                        <i className="bi bi-check-lg"></i>
                      </button>
                    ) : (
                      <button className="btn-action orange" title="Block Hospital" onClick={() => changeStatus(hospital._id, 'block')}>
                        <i className="bi bi-slash-circle"></i>
                      </button>
                    )}
                  </td>
                  <td>
                    <button className="btn-action red" title="Delete Hospital" onClick={() => changeStatus(hospital._id, 'delete')}>
                      <i className="bi bi-trash"></i>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="no-data">No hospitals found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="pagination">
          <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)}>&laquo; Prev</button>
          <span>Page {currentPage} of {totalPages}</span>
          <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)}>Next &raquo;</button>
        </div>
      )}
    </div>
  );
}

export default ManageHospitals;
