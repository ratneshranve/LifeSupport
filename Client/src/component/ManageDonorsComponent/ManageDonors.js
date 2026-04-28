import './ManageDonors.css';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { donorApi } from '../../apiurl';

function ManageDonors() {
  const [donors, setDonors] = useState([]);
  const [filteredDonors, setFilteredDonors] = useState([]);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const donorsPerPage = 5;

  useEffect(() => {
    fetchDonors();
  }, []);

  useEffect(() => {
    applySearchSort();
  }, [search, donors, sortBy]);

  const fetchDonors = () => {
    axios.get(donorApi + 'fetch-all')
      .then((res) => {
        // Only filter by role, not donorType
        const filtered = res.data.filter(d => d.role === 'donor');
        setDonors(filtered);
        setError('');
      })
      .catch(() => setError('Failed to fetch donors'));
  };

  const changeStatus = (_id, action) => {
    const update = (statusMsg, statusCode) => {
      axios.patch(donorApi + 'update', {
        condition_obj: { _id },
        content_obj: { status: statusCode }
      }).then(() => {
        alert(`Donor ${statusMsg}`);
        fetchDonors();
      }).catch(() => alert(`${statusMsg} failed`));
    };

    if (action === 'verify') update("verified", 1);
    else if (action === 'block') update("blocked", 0);
    else if (action === 'delete') {
      axios.delete(donorApi + "delete", { data: { _id } })
        .then(() => {
          alert("Donor deleted");
          fetchDonors();
        })
        .catch(() => alert("Deletion failed"));
    }
  };

  const setEligibility = (_id, eligible) => {
    axios.patch(donorApi + `verify-eligibility/${_id}`, { eligible })
      .then(() => {
        alert(`Donor marked as ${eligible ? "eligible" : "not eligible"}`);
        fetchDonors();
      })
      .catch(() => alert("Eligibility update failed"));
  };

  const applySearchSort = () => {
    let filtered = [...donors];

    if (search) {
      const term = search.toLowerCase();
      filtered = filtered.filter(d =>
        d.name?.toLowerCase().includes(term) ||
        d.email?.toLowerCase().includes(term) ||
        d.bloodGroup?.toLowerCase().includes(term)
      );
    }

    if (sortBy === 'city') {
      filtered.sort((a, b) => a.city.localeCompare(b.city));
    } else if (sortBy === 'bloodGroup') {
      filtered.sort((a, b) => a.bloodGroup.localeCompare(b.bloodGroup));
    }

    setFilteredDonors(filtered);
    setCurrentPage(1);
  };

  // Pagination Logic
  const indexOfLast = currentPage * donorsPerPage;
  const indexOfFirst = indexOfLast - donorsPerPage;
  const currentDonors = filteredDonors.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredDonors.length / donorsPerPage);

  return (
    <div className="manage-donors-container">
      <h1 className="manage-donors-title">Manage Blood Donors</h1>

      {error && <div className="alert-error">{error}</div>}

      <div className="controls">
        <input
          type="text"
          placeholder="Search by name/email/blood group"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="">Sort by</option>
          <option value="city">City</option>
          <option value="bloodGroup">Blood Group</option>
        </select>
      </div>

      <div className="table-container">
        <table className="manage-donors-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Email</th>
              <th>Mobile</th>
              <th>Gender</th>
              <th>City</th>
              <th>Blood Group</th>
              <th>Available</th>
              <th>Registered On</th>
              <th>Status</th>
              <th>Delete</th>
              <th>Report</th>
              <th>Eligibility</th>
            </tr>
          </thead>
          <tbody>
            {currentDonors.length > 0 ? (
              currentDonors.map((donor, index) => (
                <tr key={donor._id}>
                  <td>{indexOfFirst + index + 1}</td>
                  <td>{donor.name}</td>
                  <td>{donor.email}</td>
                  <td>{donor.mobile}</td>
                  <td>{donor.gender}</td>
                  <td>{donor.city}</td>
                  <td>{donor.bloodGroup || 'N/A'}</td>
                  <td>{donor.available ? 'Yes' : 'No'}</td>
                  <td>{donor.info ? new Date(donor.info).toLocaleDateString() : '-'}</td>
                  <td>
                    {donor.status === 0 ? (
                      <button className="btn-action green" title="Verify Donor" onClick={() => changeStatus(donor._id, 'verify')}>
                        <i className="bi bi-check-lg"></i>
                      </button>
                    ) : (
                      <button className="btn-action orange" title="Block Donor" onClick={() => changeStatus(donor._id, 'block')}>
                        <i className="bi bi-slash-circle"></i>
                      </button>
                    )}
                  </td>
                  <td>
                    <button className="btn-action red" title="Delete Donor" onClick={() => changeStatus(donor._id, 'delete')}>
                      <i className="bi bi-trash"></i>
                    </button>
                  </td>
                  <td>
                    {donor.reportUrl ? (
                      <div className="report-cell">
                        <a 
                          href={`http://localhost:3001/${donor.reportUrl}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="report-link"
                        >
                          {donor.reportUrl.toLowerCase().endsWith('.pdf') ? (
                            <div className="pdf-preview">
                              <i className="bi bi-file-earmark-pdf-fill"></i>
                              <span>PDF Report</span>
                            </div>
                          ) : (
                            <div className="image-preview-container">
                              <img
                                src={`http://localhost:3001/${donor.reportUrl}`}
                                alt="Report Thumbnail"
                                className="report-thumb"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = "https://cdn-icons-png.flaticon.com/512/337/337946.png"; // Fallback icon
                                }}
                              />
                              <div className="thumb-overlay">
                                <i className="bi bi-eye-fill"></i>
                              </div>
                            </div>
                          )}
                        </a>
                      </div>
                    ) : (
                      <span className="no-report">No Report</span>
                    )}
                  </td>
                  <td>
                    <div className="eligibility-actions">
                      <button
                        className="btn-action green"
                        disabled={donor.eligible}
                        title="Set Eligible"
                        onClick={() => setEligibility(donor._id, true)}
                      >
                        <i className="bi bi-person-check-fill"></i>
                      </button>
                      <button
                        className="btn-action orange"
                        disabled={!donor.eligible}
                        title="Set Not Eligible"
                        onClick={() => setEligibility(donor._id, false)}
                      >
                        <i className="bi bi-person-x"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="13" className="no-data">No blood donors found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => prev - 1)}
          >
            &laquo; Prev
          </button>

          <span>Page {currentPage} of {totalPages}</span>

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => prev + 1)}
          >
            Next &raquo;
          </button>
        </div>
      )}
    </div>
  );
}

export default ManageDonors;
