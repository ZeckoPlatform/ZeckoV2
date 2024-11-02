import React, { useState, useEffect } from 'react';

function ReviewSystem({ targetId, targetType }) {
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, [targetId]);

  const fetchReviews = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`/api/reviews/${targetType}/${targetId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const reviewsData = await response.json();
        setReviews(reviewsData);
      } else {
        throw new Error('Failed to fetch reviews');
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewReview(prev => ({ ...prev, [name]: name === 'rating' ? parseInt(value) : value }));
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`/api/reviews/${targetType}/${targetId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newReview)
      });

      if (response.ok) {
        const addedReview = await response.json();
        setReviews(prev => [...prev, addedReview]);
        setNewReview({ rating: 5, comment: '' });
        alert('Review submitted successfully!');
      } else {
        throw new Error('Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
    }
  };

  if (loading) {
    return <div>Loading reviews...</div>;
  }

  return (
    <div>
      <h3>Reviews</h3>
      {reviews.length === 0 ? (
        <p>No reviews yet.</p>
      ) : (
        <ul>
          {reviews.map((review) => (
            <li key={review._id}>
              <p>Rating: {review.rating}/5</p>
              <p>{review.comment}</p>
              <p>By: {review.reviewer.username}</p>
            </li>
          ))}
        </ul>
      )}

      <h4>Leave a Review</h4>
      <form onSubmit={handleSubmitReview}>
        <div>
          <label htmlFor="rating">Rating:</label>
          <select
            id="rating"
            name="rating"
            value={newReview.rating}
            onChange={handleInputChange}
          >
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
          </select>
        </div>
        <div>
          <label htmlFor="comment">Comment:</label>
          <textarea
            id="comment"
            name="comment"
            value={newReview.comment}
            onChange={handleInputChange}
            required
          />
        </div>
        <button type="submit">Submit Review</button>
      </form>
    </div>
  );
}

export default ReviewSystem;
