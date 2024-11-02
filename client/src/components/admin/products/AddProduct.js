import React from 'react';
import { useNavigate } from 'react-router-dom';

const AddProduct = () => {
  const navigate = useNavigate();

  return (
    <div>
      <h1>Add Product</h1>
      <p>Add product interface coming soon...</p>
      <button onClick={() => navigate('/admin/products')}>Back to Products</button>
    </div>
  );
};

export default AddProduct; 