import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { DataGrid } from '@mui/x-data-grid';
import { Button, IconButton, Tooltip } from '@mui/material';
import { Edit, Delete, Add, Visibility } from '@mui/icons-material';
import { toast } from 'react-toastify';
import DeleteProduct from './products/DeleteProduct';

// Styled components from your existing code
const Container = styled.div`
  padding: 20px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const ActionButton = styled(Button)`
  margin: 0 5px;
`;

function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const navigate = useNavigate();

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
        const data = await response.json();
        setProducts(data);
      } else {
        throw new Error('Failed to fetch products');
      }
    } catch (error) {
      toast.error('Error loading products');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (product) => {
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
        toast.success('Product deleted successfully');
      } else {
        throw new Error('Failed to delete product');
      }
    } catch (error) {
      toast.error('Error deleting product');
      console.error('Error:', error);
    } finally {
      setShowDeleteModal(false);
      setProductToDelete(null);
    }
  };

  const columns = [
    { field: '_id', headerName: 'ID', width: 90 },
    { field: 'name', headerName: 'Product Name', width: 200 },
    { field: 'price', headerName: 'Price', width: 130 },
    { field: 'description', headerName: 'Description', width: 200 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 200,
      renderCell: (params) => (
        <>
          <Tooltip title="View Details">
            <IconButton onClick={() => navigate(`/admin/products/${params.row._id}`)}>
              <Visibility />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit">
            <IconButton onClick={() => navigate(`/admin/products/edit/${params.row._id}`)}>
              <Edit />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton onClick={() => handleDelete(params.row)} color="error">
              <Delete />
            </IconButton>
          </Tooltip>
        </>
      ),
    },
  ];

  return (
    <Container>
      <Header>
        <h2>Product Management</h2>
        <ActionButton
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={() => navigate('/admin/products/add')}
        >
          Add New Product
        </ActionButton>
      </Header>
      
      <DataGrid
        rows={products}
        columns={columns}
        pageSize={10}
        rowsPerPageOptions={[10, 25, 50]}
        checkboxSelection
        disableSelectionOnClick
        loading={loading}
        autoHeight
        getRowId={(row) => row._id}
      />

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
    </Container>
  );
}

export default ProductManagement;
