import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import OptimizedImage from '../../common/OptimizedImage';

// Reuse the styled components from AddProduct
const Container = styled.div`
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-weight: 500;
  color: #333;
`;

const Input = styled.input`
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;

  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

const TextArea = styled.textarea`
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  min-height: 100px;
  font-size: 16px;

  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 20px;
`;

const Button = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  
  ${props => props.variant === 'secondary' ? `
    background: #6c757d;
    color: white;
    &:hover {
      background: #5a6268;
    }
  ` : `
    background: var(--primary-color);
    color: white;
    &:hover {
      opacity: 0.9;
    }
  `}
`;

const ImagePreview = styled.img`
  max-width: 200px;
  max-height: 200px;
  margin-top: 10px;
  border-radius: 4px;
`;

function EditProduct({ product }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: '',
    image: null
  });
  const [currentImage, setCurrentImage] = useState('');

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  const fetchProduct = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/dashboard/products/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch product');

      const product = await response.json();
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        category: product.category,
        image: null
      });
      setCurrentImage(product.mainImage);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error loading product');
      navigate('/admin/products');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'file' ? files[0] : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const formDataToSend = new FormData();
      
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null) {
          formDataToSend.append(key, formData[key]);
        }
      });

      const response = await fetch(`/api/dashboard/products/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      if (!response.ok) throw new Error('Failed to update product');
      
      toast.success('Product updated successfully');
      navigate('/admin/products');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error updating product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <h2>Edit Product</h2>
      <div className="product-images">
        <OptimizedImage
          src={currentImage}
          alt={formData.name}
          width={300}
          height={300}
          className="product-edit-image"
        />
        {product.additionalImages?.map((image, index) => (
          <OptimizedImage
            key={index}
            src={image}
            alt={`${formData.name} view ${index + 1}`}
            width={100}
            height={100}
            className="product-edit-thumbnail"
          />
        ))}
      </div>
      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <Label>Product Name</Label>
          <Input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </FormGroup>

        <FormGroup>
          <Label>Description</Label>
          <TextArea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
          />
        </FormGroup>

        <FormGroup>
          <Label>Price</Label>
          <Input
            type="number"
            name="price"
            step="0.01"
            value={formData.price}
            onChange={handleChange}
            required
          />
        </FormGroup>

        <FormGroup>
          <Label>Stock</Label>
          <Input
            type="number"
            name="stock"
            value={formData.stock}
            onChange={handleChange}
            required
          />
        </FormGroup>

        <FormGroup>
          <Label>Category</Label>
          <Input
            type="text"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
          />
        </FormGroup>

        <FormGroup>
          <Label>Product Image</Label>
          <Input
            type="file"
            name="image"
            accept="image/*"
            onChange={handleChange}
          />
        </FormGroup>

        <ButtonGroup>
          <Button 
            type="button" 
            variant="secondary" 
            onClick={() => navigate('/admin/products')}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Updating...' : 'Update Product'}
          </Button>
        </ButtonGroup>
      </Form>
    </Container>
  );
}

export default EditProduct; 