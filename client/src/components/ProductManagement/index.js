import React from 'react';
import { useNavigate } from 'react-router-dom';

const ProductManagement = () => {
  const navigate = useNavigate();

  return (
    <div>
      <h2>Product Management</h2>
      <button onClick={() => navigate('/admin/products/add')}>Add New Product</button>
      {/* Product list will go here */}
    </div>
  );
};

export default ProductManagement; 