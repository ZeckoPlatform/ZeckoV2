import { useState } from 'react';
import { updateProposalStatus } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';

const ProposalList = ({ proposals, leadId, onProposalUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleStatusUpdate = async (proposalId, status) => {
    setLoading(true);
    setError(null);
    try {
      await updateProposalStatus(leadId, proposalId, status);
      onProposalUpdate(); // Refresh lead data
    } catch (err) {
      setError('Failed to update proposal status');
      console.error('Proposal status update error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="proposals-container">
      <h3>Proposals ({proposals.length})</h3>
      {proposals.length === 0 ? (
        <p>No proposals received yet</p>
      ) : (
        <div className="proposal-list">
          {proposals.map((proposal) => (
            <div key={proposal._id} className="proposal-card">
              <div className="proposal-header">
                <h4>Proposal from {proposal.contractor.businessName}</h4>
                <span className={`status-badge status-${proposal.status}`}>
                  {proposal.status}
                </span>
              </div>
              
              <div className="proposal-details">
                <div className="detail-row">
                  <span>Amount:</span>
                  <strong>${proposal.amount}</strong>
                </div>
                <div className="detail-row">
                  <span>Estimated Time:</span>
                  <strong>{proposal.estimatedTime} days</strong>
                </div>
                <div className="detail-row">
                  <span>Submitted:</span>
                  <strong>{new Date(proposal.submittedAt).toLocaleDateString()}</strong>
                </div>
              </div>

              <div className="proposal-description">
                <p>{proposal.description}</p>
              </div>

              {proposal.status === 'pending' && (
                <div className="proposal-actions">
                  <button
                    onClick={() => handleStatusUpdate(proposal._id, 'accepted')}
                    className="btn btn-success"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(proposal._id, 'rejected')}
                    className="btn btn-danger ms-2"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProposalList; 