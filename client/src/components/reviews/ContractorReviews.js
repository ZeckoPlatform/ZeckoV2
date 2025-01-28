import { useState, useEffect } from 'react';
import { getContractorReviews } from '../../services/api';
import StarRating from '../common/StarRating';
import LoadingSpinner from '../common/LoadingSpinner';
import Pagination from '../common/Pagination';

const ContractorReviews = ({ contractorId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const data = await getContractorReviews(contractorId, page);
        setReviews(data.reviews);
        setTotalPages(data.totalPages);
      } catch (err) {
        setError('Error loading reviews');
        console.error('Reviews fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [contractorId, page]);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="alert alert-danger">{error}</div>;

  const averageRating = reviews.length 
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <div className="contractor-reviews">
      <div className="reviews-summary">
        <h3>Contractor Reviews</h3>
        <div className="rating-summary">
          <StarRating value={parseFloat(averageRating)} readonly />
          <span className="rating-average">
            {averageRating} out of 5 ({reviews.length} reviews)
          </span>
        </div>
      </div>

      {reviews.length === 0 ? (
        <p>No reviews yet</p>
      ) : (
        <div className="reviews-list">
          {reviews.map((review) => (
            <div key={review._id} className="review-card">
              <div className="review-header">
                <StarRating value={review.rating} readonly />
                <span className="review-date">
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="review-comment">{review.comment}</p>
              <div className="review-footer">
                <span className="reviewer-name">
                  {review.clientId.name}
                </span>
                <span className="lead-reference">
                  Lead: {review.leadId.title}
                </span>
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

export default ContractorReviews; 