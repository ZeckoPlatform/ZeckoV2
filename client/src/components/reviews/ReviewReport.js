import { useState } from 'react';
import { reportReview } from '../../services/api';

const ReviewReport = ({ reviewId, onClose, onSuccess }) => {
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await reportReview(reviewId, { reason });
            onSuccess();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Error reporting review');
            console.error('Review report error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="review-report-modal">
            <h4>Report Review</h4>
            {error && <div className="alert alert-danger">{error}</div>}
            
            <form onSubmit={handleSubmit}>
                <div className="form-group mb-3">
                    <label htmlFor="reason">Reason for Report</label>
                    <select
                        id="reason"
                        className="form-select"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        required
                    >
                        <option value="">Select a reason</option>
                        <option value="inappropriate">Inappropriate Content</option>
                        <option value="spam">Spam</option>
                        <option value="fake">Fake Review</option>
                        <option value="other">Other</option>
                    </select>
                </div>

                <div className="button-group">
                    <button
                        type="submit"
                        className="btn btn-danger"
                        disabled={loading}
                    >
                        {loading ? 'Submitting...' : 'Submit Report'}
                    </button>
                    <button
                        type="button"
                        className="btn btn-secondary ms-2"
                        onClick={onClose}
                        disabled={loading}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ReviewReport; 