import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    CircularProgress,
    Typography
} from '@mui/material';
import api from '../../services/api';
import ProductDetail from './ProductDetail';

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await api.get(`/api/products/${id}`);
                setProduct(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching product:', error);
                setError(error.message);
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    if (loading) {
        return (
            <Container>
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                    <CircularProgress />
                </Box>
            </Container>
        );
    }

    if (error) {
        return (
            <Container>
                <Box py={4}>
                    <Typography color="error">Error: {error}</Typography>
                </Box>
            </Container>
        );
    }

    if (!product) {
        return (
            <Container>
                <Box py={4}>
                    <Typography>Product not found</Typography>
                </Box>
            </Container>
        );
    }

    return (
        <Container>
            <Box py={4}>
                <ProductDetail product={product} />
            </Box>
        </Container>
    );
};

export default ProductDetails;
