import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardCard from './common/DashboardCard';
import { FiEdit2, FiTrash2, FiPlus, FiImage } from 'react-icons/fi';

const ProductsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const ActionBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.md};
`;

const SearchBar = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  flex: 1;
  min-width: 300px;
`;

const SearchInput = styled.input`
  padding: ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.text.disabled}40;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  flex: 1;
  background: ${({ theme }) => theme.colors.background.paper};
  color: ${({ theme }) => theme.colors.text.primary};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary.main};
  }
`;

const Button = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.md};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ variant, theme }) =>
    variant === 'outlined'
      ? 'transparent'
      : theme.colors.primary.gradient};
  color: ${({ variant, theme }) =>
    variant === 'outlined'
      ? theme.colors.primary.main
      : theme.colors.primary.text};
  cursor: pointer;
  font-weight: 500;
  border: ${({ variant, theme }) =>
    variant === 'outlined'
      ? `1px solid ${theme.colors.primary.main}`
      : 'none'};

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
`;

const ProductCard = styled(motion.div)`
  background: ${({ theme }) => theme.colors.background.paper};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  overflow: hidden;
  box-shadow: ${({ theme }) => theme.shadows.card};
`;

const ProductImage = styled.div`
  position: relative;
  padding-top: 100%;
  background: ${({ theme }) => theme.colors.background.main};
  
  img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const ProductInfo = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
`;

const ProductTitle = styled.h3`
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const ProductPrice = styled.div`
  font-weight: bold;
  color: ${({ theme }) => theme.colors.primary.main};
`;

const ProductActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.sm};
  border-top: 1px solid ${({ theme }) => theme.colors.text.disabled}20;
`;

const Modal = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled(motion.div)`
  background: ${({ theme }) => theme.colors.background.paper};
  padding: ${({ theme }) => theme.spacing.xl};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  width: 100%;
  max-width: 600px;
  margin: ${({ theme }) => theme.spacing.lg};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const Label = styled.label`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 0.9rem;
`;

const Input = styled.input`
  padding: ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.text.disabled}40;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ theme }) => theme.colors.background.main};
  color: ${({ theme }) => theme.colors.text.primary};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary.main};
  }
`;

const TextArea = styled.textarea`
  padding: ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.text.disabled}40;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ theme }) => theme.colors.background.main};
  color: ${({ theme }) => theme.colors.text.primary};
  min-height: 100px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary.main};
  }
`;

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      // Replace with your actual API call
      const response = await fetch('/api/products');
      const data = await response.json();
      setProducts(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      setLoading(false);
    }
  };

  const handleAddEdit = (product = null) => {
    setSelectedProduct(product);
    setModalOpen(true);
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await fetch(`/api/products/${productId}`, { method: 'DELETE' });
        setProducts(products.filter(p => p.id !== productId));
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Handle form submission
    setModalOpen(false);
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <ProductsContainer>
      <ActionBar>
        <SearchBar>
          <SearchInput
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </SearchBar>
        <Button
          onClick={() => handleAddEdit()}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <FiPlus /> Add Product
        </Button>
      </ActionBar>

      <ProductGrid>
        {filteredProducts.map((product) => (
          <ProductCard
            key={product.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <ProductImage>
              <img src={product.image} alt={product.name} />
            </ProductImage>
            <ProductInfo>
              <ProductTitle>{product.name}</ProductTitle>
              <ProductPrice>${product.price}</ProductPrice>
            </ProductInfo>
            <ProductActions>
              <Button
                variant="outlined"
                onClick={() => handleAddEdit(product)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FiEdit2 />
              </Button>
              <Button
                variant="outlined"
                onClick={() => handleDelete(product.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FiTrash2 />
              </Button>
            </ProductActions>
          </ProductCard>
        ))}
      </ProductGrid>

      <AnimatePresence>
        {modalOpen && (
          <Modal
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ModalContent
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
            >
              <h2>{selectedProduct ? 'Edit Product' : 'Add Product'}</h2>
              <Form onSubmit={handleSubmit}>
                <FormGroup>
                  <Label>Product Name</Label>
                  <Input
                    type="text"
                    defaultValue={selectedProduct?.name}
                    required
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Price</Label>
                  <Input
                    type="number"
                    step="0.01"
                    defaultValue={selectedProduct?.price}
                    required
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Description</Label>
                  <TextArea
                    defaultValue={selectedProduct?.description}
                    required
                  />
                </FormGroup>
                <FormGroup>
                  <Label>Image</Label>
                  <Input type="file" accept="image/*" />
                </FormGroup>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                  <Button
                    type="button"
                    variant="outlined"
                    onClick={() => setModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    {selectedProduct ? 'Update' : 'Create'}
                  </Button>
                </div>
              </Form>
            </ModalContent>
          </Modal>
        )}
      </AnimatePresence>
    </ProductsContainer>
  );
};

export default Products; 