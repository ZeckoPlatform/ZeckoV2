import React, { useState, useEffect } from 'react';
import {
    Grid,
    Paper,
    Typography,
    Box,
    Button,
    Rating,
    Divider,
    TextField,
    Tabs,
    Tab,
    ImageList,
    ImageListItem
} from '@mui/material';
import styled from 'styled-components';
import BiddingWrapper from './BiddingWrapper';
import { useAuth } from '../../contexts/AuthContext';
import OptimizedImage from '../common/OptimizedImage';

const ProductImage = styled(Box)`
    width: 100%;
    padding-top: 100%;
    position: relative;
    background-size: cover;
    background-position: center;
`;

const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index}>
        {value === index && <Box py={3}>{children}</Box>}
    </div>
);

const ProductDetail = ({ product }) => {
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState(0);
    const [selectedImage, setSelectedImage] = useState(0);
    const [autoBid, setAutoBid] = useState(null);
    const { user } = useAuth();

    useEffect(() => {
        const fetchAutoBid = async () => {
            if (user && product?.bidding?.enabled) {
                try {
                    const response = await fetch(`/api/bids/auto/${product._id}`);
                    if (response.ok) {
                        const data = await response.json();
                        setAutoBid(data.data.autoBid);
                    }
                } catch (error) {
                    console.error('Error fetching auto-bid settings:', error);
                }
            }
        };

        fetchAutoBid();
    }, [user, product?._id]);

    const handleAutoBidUpdate = async (settings) => {
        try {
            const response = await fetch(`/api/bids/auto/${product._id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(settings)
            });

            if (!response.ok) throw new Error('Failed to update auto-bid settings');
            const data = await response.json();
            setAutoBid(data.data.autoBid);
        } catch (err) {
            console.error('Error updating auto-bid:', err);
            throw err;
        }
    };

    const handleAddToCart = () => {
        // Implement add to cart functionality
    };

    if (!product) {
        return (
            <Box p={4}>
                <Typography>Product not found</Typography>
            </Box>
        );
    }

    return (
        <div className="product-detail">
            <div className="product-images">
                <OptimizedImage
                    src={product.mainImage}
                    alt={product.name}
                    width={600}
                    height={600}
                    className="product-main-image"
                />
                {product.additionalImages?.map((image, index) => (
                    <OptimizedImage
                        key={index}
                        src={image}
                        alt={`${product.name} - view ${index + 1}`}
                        width={150}
                        height={150}
                        className="product-thumbnail"
                    />
                ))}
            </div>
            
            <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                    <Typography variant="h4" gutterBottom>
                        {product?.name}
                    </Typography>
                    
                    <Box display="flex" alignItems="center" mb={2}>
                        <Rating 
                            value={product?.rating?.average || 0} 
                            precision={0.5} 
                            readOnly 
                        />
                        <Typography variant="body2" color="textSecondary" ml={1}>
                            ({product?.rating?.count || 0} reviews)
                        </Typography>
                    </Box>

                    <Box mb={3}>
                        <Typography variant="h4" component="span">
                            £{product?.price?.sale || product?.price?.regular || 0}
                        </Typography>
                        {product?.price?.sale && (
                            <Typography
                                variant="h6"
                                component="span"
                                color="textSecondary"
                                sx={{ textDecoration: 'line-through', ml: 2 }}
                            >
                                £{product.price.regular}
                            </Typography>
                        )}
                    </Box>

                    <Typography variant="body1" paragraph>
                        {product?.shortDescription}
                    </Typography>

                    <Box mb={3}>
                        <TextField
                            type="number"
                            label="Quantity"
                            value={quantity}
                            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value)))}
                            InputProps={{ inputProps: { min: 1 } }}
                            sx={{ width: 100, mr: 2 }}
                        />
                        <Button
                            variant="contained"
                            size="large"
                            onClick={handleAddToCart}
                            disabled={!product?.stock?.quantity}
                        >
                            Add to Cart
                        </Button>
                    </Box>

                    <Divider />

                    {product?.bidding?.enabled && (
                        <Box mt={3}>
                            <BiddingWrapper
                                product={product}
                                autoBid={autoBid}
                                onAutoBidUpdate={handleAutoBidUpdate}
                            />
                        </Box>
                    )}

                    <Box mt={3}>
                        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
                            <Tab label="Description" />
                            <Tab label="Additional Information" />
                            <Tab label="Reviews" />
                        </Tabs>

                        <TabPanel value={activeTab} index={0}>
                            <Typography>{product?.description}</Typography>
                        </TabPanel>

                        <TabPanel value={activeTab} index={1}>
                            <Grid container spacing={2}>
                                {product?.attributes?.map((attr, index) => (
                                    <Grid item xs={12} key={index}>
                                        <Typography component="span" fontWeight="bold">
                                            {attr.name}:
                                        </Typography>
                                        <Typography component="span" ml={1}>
                                            {attr.value}
                                        </Typography>
                                    </Grid>
                                ))}
                            </Grid>
                        </TabPanel>

                        <TabPanel value={activeTab} index={2}>
                            {/* Add ReviewList component here */}
                        </TabPanel>
                    </Box>
                </Grid>
            </Grid>
        </div>
    );
};

export default ProductDetail;