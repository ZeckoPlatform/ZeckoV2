import { useState, useEffect } from 'react';
import { getPendingVerifications, handleVerification } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import Pagination from '../common/Pagination';

const BusinessVerification = () => {
    const [verifications, setVerifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedBusiness, setSelectedBusiness] = useState(null);

    useEffect(() => {
        fetchVerifications();
    }, [page]);

    const fetchVerifications = async () => {
        try {
            const data = await getPendingVerifications(page);
            setVerifications(data.verifications);
            setTotalPages(data.totalPages);
        } catch (err) {
            setError('Error loading verifications');
            console.error('Verifications fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleVerificationUpdate = async (businessId, status, reason = '') => {
        try {
            await handleVerification(businessId, status, reason);
            // Remove from list after handling
            setVerifications(verifications.filter(v => v._id !== businessId));
            setSelectedBusiness(null);
        } catch (err) {
            setError('Error updating verification status');
            console.error('Verification update error:', err);
        }
    };

    if (loading) return <LoadingSpinner />;
    if (error) return <div className="alert alert-danger">{error}</div>;

    return (
        <div className="business-verification">
            <h2>Business Verifications</h2>
            
            {verifications.length === 0 ? (
                <p>No pending verifications</p>
            ) : (
                <div className="table-responsive">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Business Name</th>
                                <th>Owner</th>
                                <th>Documents</th>
                                <th>Submitted</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {verifications.map((verification) => (
                                <tr key={verification._id}>
                                    <td>{verification.businessName}</td>
                                    <td>
                                        {verification.userId.name}
                                        <br />
                                        <small>{verification.userId.email}</small>
                                    </td>
                                    <td>
                                        {verification.documents.map((doc, index) => (
                                            <a
                                                key={index}
                                                href={doc.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="btn btn-sm btn-outline-primary me-2"
                                            >
                                                View {doc.type}
                                            </a>
                                        ))}
                                    </td>
                                    <td>
                                        {new Date(verification.createdAt).toLocaleDateString()}
                                    </td>
                                    <td>
                                        <button
                                            className="btn btn-sm btn-primary me-2"
                                            onClick={() => setSelectedBusiness(verification)}
                                        >
                                            Review
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {totalPages > 1 && (
                <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
                />
            )}

            {selectedBusiness && (
                <div className="modal show d-block" tabIndex="-1">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    Review: {selectedBusiness.businessName}
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setSelectedBusiness(null)}
                                />
                            </div>
                            <div className="modal-body">
                                <div className="verification-details mb-3">
                                    <p><strong>Business Type:</strong> {selectedBusiness.businessType}</p>
                                    <p><strong>Address:</strong> {selectedBusiness.address}</p>
                                    <p><strong>Phone:</strong> {selectedBusiness.phone}</p>
                                    <p><strong>License Number:</strong> {selectedBusiness.licenseNumber}</p>
                                </div>

                                <div className="verification-actions">
                                    <button
                                        className="btn btn-success me-2"
                                        onClick={() => handleVerificationUpdate(selectedBusiness._id, 'approved')}
                                    >
                                        Approve
                                    </button>
                                    <button
                                        className="btn btn-danger"
                                        onClick={() => {
                                            const reason = window.prompt('Enter rejection reason:');
                                            if (reason) {
                                                handleVerificationUpdate(selectedBusiness._id, 'rejected', reason);
                                            }
                                        }}
                                    >
                                        Reject
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BusinessVerification; 