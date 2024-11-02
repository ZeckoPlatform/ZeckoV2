import React, { useState, useEffect } from 'react';
import DeleteProduct from './products/DeleteProduct';

function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newProduct, setNewProduct] = useState({ name: '', description: '', price: '' });
  const [editingProduct, setEditingProduct] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('/api/dashboard/products', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const productsData = await response.json();
        setProducts(productsData);
      } else {
        throw new Error('Failed to fetch products');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e, isNewProduct = true) => {
    const { name, value } = e.target;
    if (isNewProduct) {
      setNewProduct(prev => ({ ...prev, [name]: value }));
    } else {
      setEditingProduct(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('/api/dashboard/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newProduct)
      });

      if (response.ok) {
        const addedProduct = await response.json();
        setProducts(prev => [...prev, addedProduct]);
        setNewProduct({ name: '', description: '', price: '' });
        alert('Product added successfully!');
      } else {
        throw new Error('Failed to add product');
      }
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Failed to add product. Please try again.');
    }
  };

  const handleEditProduct = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`/api/dashboard/products/${editingProduct._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editingProduct)
      });

      if (response.ok) {
        const updatedProduct = await response.json();
        setProducts(prev => prev.map(p => p._id === updatedProduct._id ? updatedProduct : p));
        setEditingProduct(null);
        alert('Product updated successfully!');
      } else {
        throw new Error('Failed to update product');
      }
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Failed to update product. Please try again.');
    }
  };

  const handleDeleteProduct = (product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`/api/dashboard/products/${productToDelete._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setProducts(prev => prev.filter(p => p._id !== productToDelete._id));
        alert('Product deleted successfully!');
      } else {
        throw new Error('Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product. Please try again.');
    } finally {
      setShowDeleteModal(false);
      setProductToDelete(null);
    }
  };

  if (loading) {
    return <div>Loading products...</div>;
  }

  return (
    <div>
      <h3>Your Products</h3>
      <form onSubmit={handleAddProduct}>
        <h4>Add New Product</h4>
        <div>
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={newProduct.name}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <label htmlFor="description">Description:</label>
          <textarea
            id="description"
            name="description"
            value={newProduct.description}
            onChange={handleInputChange}
            required
          />
        </div>
        <div>
          <label htmlFor="price">Price:</label>
          <input
            type="number"
            id="price"
            name="price"
            value={newProduct.price}
            onChange={handleInputChange}
            required
          />
        </div>
        <button type="submit">Add Product</button>
      </form>

      <h4>Your Product List</h4>
      {products.length === 0 ? (
        <p>You haven't added any products yet.</p>
      ) : (
        <ul>
          {products.map((product) => (
            <li key={product._id}>
              {editingProduct && editingProduct._id === product._id ? (
                <form onSubmit={handleEditProduct}>
                  <input
                    type="text"
                    name="name"
                    value={editingProduct.name}
                    onChange={(e) => handleInputChange(e, false)}
                    required
                  />
                  <textarea
                    name="description"
                    value={editingProduct.description}
                    onChange={(e) => handleInputChange(e, false)}
                    required
                  />
                  <input
                    type="number"
                    name="price"
                    value={editingProduct.price}
                    onChange={(e) => handleInputChange(e, false)}
                    required
                  />
                  <button type="submit">Save</button>
                  <button type="button" onClick={() => setEditingProduct(null)}>Cancel</button>
                </form>
              ) : (
                <>
                  <h5>{product.name}</h5>
                  <p>{product.description}</p>
                  <p>Price: ${product.price}</p>
                  <button onClick={() => setEditingProduct(product)}>Edit</button>
                  <button onClick={() => handleDeleteProduct(product)}>Delete</button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
      {showDeleteModal && productToDelete && (
        <DeleteProduct
          product={productToDelete}
          onConfirm={confirmDelete}
          onCancel={() => {
            setShowDeleteModal(false);
            setProductToDelete(null);
          }}
        />
      )}
    </div>
  );
}

export default ProductManagement;
