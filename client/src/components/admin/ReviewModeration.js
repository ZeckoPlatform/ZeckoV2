import { useState, useEffect } from 'react';
import { getReportedReviews, moderateReview } from '../../services/api';
import StarRating from '../common/StarRating';
import LoadingSpinner from '../common/LoadingSpinner';
import Pagination from '../common/Pagination';

const ReviewModeration = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchReviews();
  }, [page]);

  const fetchReviews = async () => {
    try {
      const data = await getReportedReviews(page);
      setReviews(data.reviews);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError('Error loading reported reviews');
      console.error('Reported reviews fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleModeration = async (reviewId, action) => {
    try {
      await moderateReview(reviewId, action);
      // Remove the moderated review from the list
      setReviews(reviews.filter(review => review._id !== reviewId));
    } catch (err) {
      setError('Error moderating review');
      console.error('Review moderation error:', err);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="review-moderation">
      <h2>Review Moderation</h2>
      
      {reviews.length === 0 ? (
        <p>No reviews pending moderation</p>
      ) : (
        <div className="reported-reviews-list">
          {reviews.map((review) => (
            <div key={review._id} className="review-card">
              <div className="review-header">
                <StarRating value={review.rating} readonly />
                <span className="review-date">
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
              </div>
              
              <p className="review-comment">{review.comment}</p>
              
              <div className="review-details">
                <p>Client: {review.clientId.name}</p>
                <p>Contractor: {review.contractorId.businessName}</p>
                <p>Lead: {review.leadId.title}</p>
              </div>

              <div className="moderation-actions">
                <button
                  onClick={() => handleModeration(review._id, 'approve')}
                  className="btn btn-success me-2"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleModeration(review._id, 'remove')}
                  className="btn btn-danger"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      )}
    </div>
  );
};

export default ReviewModeration; 