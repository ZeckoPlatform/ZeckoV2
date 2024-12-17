import React from 'react';
import {
    Grid,
    Card,
    CardMedia,
    CardContent,
    Typography,
    Box,
    Rating,
    Chip,
    IconButton
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import FavoriteIcon from '@mui/icons-material/Favorite';
import styled from 'styled-components';

const ProductCard = styled(Card)`
    height: 100%;
    display: flex;
    flex-direction: column;
    position: relative;
    transition: transform 0.2s;
    
    &:hover {
        transform: translateY(-4px);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    }
`;

const ProductImage = styled(CardMedia)`
    padding-top: 75%;
    position: relative;
`;

const PriceTag = styled(Box)`
    position: absolute;
    bottom: 8px;
    right: 8px;
    background: rgba(255, 255, 255, 0.9);
    padding: 4px 8px;
    border-radius: 4px;
`;

const SaleChip = styled(Chip)`
    position: absolute;
    top: 8px;
    left: 8px;
`;

const ProductList = ({ products }) => {
    const navigate = useNavigate();

    const handleProductClick = (slug) => {
        navigate(`/products/${slug}`);
    };

    return (
        <Grid container spacing={3}>
            {products.map((product) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={product._id}>
                    <ProductCard>
                        <ProductImage
                            image={product.images[0]?.url || '/default-product.jpg'}
                            title={product.name}
                            onClick={() => handleProductClick(product.slug)}
                            style={{ cursor: 'pointer' }}
                        >
                            {product.price.sale && (
                                <SaleChip
                                    label={`${Math.round((1 - product.price.sale/product.price.regular) * 100)}% OFF`}
                                    color="error"
                                    size="small"
                                />
                            )}
                            <PriceTag>
                                <Typography variant="h6" component="span">
                                    £{product.price.sale || product.price.regular}
                                </Typography>
                                {product.price.sale && (
                                    <Typography
                                        variant="body2"
                                        component="span"
                                        color="textSecondary"
                                        sx={{ textDecoration: 'line-through', ml: 1 }}
                                    >
                                        £{product.price.regular}
                                    </Typography>
                                )}
                            </PriceTag>
                        </ProductImage>
                        <CardContent>
                            <Typography 
                                variant="h6" 
                                component="h2"
                                noWrap
                                onClick={() => handleProductClick(product.slug)}
                                style={{ cursor: 'pointer' }}
                            >
                                {product.name}
                            </Typography>
                            <Typography 
                                variant="body2" 
                                color="textSecondary"
                                noWrap
                            >
                                {product.shortDescription}
                            </Typography>
                            <Box display="flex" alignItems="center" mt={1}>
                                <Rating 
                                    value={product.rating.average} 
                                    precision={0.5} 
                                    size="small" 
                                    readOnly 
                                />
                                <Typography variant="body2" color="textSecondary" ml={1}>
                                    ({product.rating.count})
                                </Typography>
                            </Box>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                                <Typography variant="body2" color="textSecondary">
                                    {product.vendor.name}
                                </Typography>
                                <Box>
                                    <IconButton size="small">
                                        <FavoriteIcon />
                                    </IconButton>
                                    <IconButton size="small">
                                        <ShoppingCartIcon />
                                    </IconButton>
                                </Box>
                            </Box>
                        </CardContent>
                    </ProductCard>
                </Grid>
            ))}
        </Grid>
    );
};

export default ProductList; 