import React from 'react';
import { useParams } from 'react-router-dom';

const EditProduct = () => {
  const { id } = useParams();

  return (
    <div>
      <h2>Edit Product {id}</h2>
      {/* Add your form here */}
    </div>
  );
};

export default EditProduct; 