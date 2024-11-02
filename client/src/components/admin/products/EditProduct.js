import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div>
      <h1>Edit Product</h1>
      <p>Edit product interface for ID: {id} coming soon...</p>
      <button onClick={() => navigate('/admin/products')}>Back to Products</button>
    </div>
  );
};

export default EditProduct; 