import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getLeadReview, createLeadReview } from '../../services/api';
import StarRating from '../common/StarRating';
import LoadingSpinner from '../common/LoadingSpinner';

const LeadReview = () => {
  const { leadId } = useParams();
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    rating: 5,
    comment: ''
  });

  useEffect(() => {
    const fetchReview = async () => {
      try {
        const data = await getLeadReview(leadId);
        setReview(data);
      } catch (err) {
        if (err.response?.status !== 404) {
          setError('Error loading review');
          console.error('Review fetch error:', err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchReview();
  }, [leadId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const newReview = await createLeadReview(leadId, formData);
      setReview(newReview);
    } catch (err) {
      setError(err.response?.data?.message || 'Error submitting review');
      console.error('Review submission error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  if (review) {
    return (
      <div className="review-display">
        <h3>Your Review</h3>
        <div className="review-content">
          <StarRating value={review.rating} readonly />
          <p className="review-comment">{review.comment}</p>
          <small className="review-date">
            Posted on {new Date(review.createdAt).toLocaleDateString()}
          </small>
        </div>
      </div>
    );
  }

  return (
    <div className="review-form-container">
      <h3>Leave a Review</h3>
      {error && <div className="alert alert-danger">{error}</div>}
      
      <form onSubmit={handleSubmit} className="review-form">
        <div className="form-group mb-3">
          <label>Rating</label>
          <StarRating
            value={formData.rating}
            onChange={(rating) => setFormData(prev => ({ ...prev, rating }))}
          />
        </div>

        <div className="form-group mb-3">
          <label htmlFor="comment">Comment</label>
          <textarea
            id="comment"
            className="form-control"
            value={formData.comment}
            onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
            rows="4"
            required
            minLength={10}
          />
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          Submit Review
        </button>
      </form>
    </div>
  );
};

export default LeadReview; 