import React, { useState } from 'react';
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
    Chip,
    Avatar
} from '@mui/material';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Thumbs } from 'swiper';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/thumbs';
import styled from 'styled-components';

const ProductImage = styled(Box)`
    width: 100%;
    padding-top: 100%;
    position: relative;
    background-size: cover;
    background-position: center;
`;

const ThumbImage = styled(Box)`
    width: 100%;
    padding-top: 100%;
    background-size: cover;
    background-position: center;
    cursor: pointer;
    opacity: ${props => props.active ? 1 : 0.6};
    transition: opacity 0.2s;
    
    &:hover {
        opacity: 1;
    }
`;

const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index}>
        {value === index && <Box py={3}>{children}</Box>}
    </div>
);

const ProductDetail = ({ product }) => {
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState(0);
    const [thumbsSwiper, setThumbsSwiper] = useState(null);

    const handleAddToCart = () => {
        // Implement add to cart functionality
    };

    return (
        <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
                <Swiper
                    modules={[Navigation, Thumbs]}
                    navigation
                    thumbs={{ swiper: thumbsSwiper }}
                >
                    {product.images.map((image, index) => (
                        <SwiperSlide key={index}>
                            <ProductImage
                                style={{ backgroundImage: `url(${image.url})` }}
                            />
                        </SwiperSlide>
                    ))}
                </Swiper>
                <Box mt={2}>
                    <Swiper
                        onSwiper={setThumbsSwiper}
                        spaceBetween={10}
                        slidesPerView={4}
                        watchSlidesProgress
                    >
                        {product.images.map((image, index) => (
                            <SwiperSlide key={index}>
                                <ThumbImage
                                    style={{ backgroundImage: `url(${image.url})` }}
                                />
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
                <Typography variant="h4" gutterBottom>
                    {product.name}
                </Typography>
                
                <Box display="flex" alignItems="center" mb={2}>
                    <Rating 
                        value={product.rating.average} 
                        precision={0.5} 
                        readOnly 
                    />
                    <Typography variant="body2" color="textSecondary" ml={1}>
                        ({product.rating.count} reviews)
                    </Typography>
                </Box>

                <Box mb={3}>
                    <Typography variant="h4" component="span">
                        £{product.price.sale || product.price.regular}
                    </Typography>
                    {product.price.sale && (
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
                    {product.shortDescription}
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
                        disabled={!product.stock.quantity}
                    >
                        Add to Cart
                    </Button>
                </Box>

                <Divider />

                <Box mt={3}>
                    <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
                        <Tab label="Description" />
                        <Tab label="Additional Information" />
                        <Tab label="Reviews" />
                    </Tabs>

                    <TabPanel value={activeTab} index={0}>
                        <Typography>{product.description}</Typography>
                    </TabPanel>

                    <TabPanel value={activeTab} index={1}>
                        <Grid container spacing={2}>
                            {product.attributes.map((attr, index) => (
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
    );
};

export default ProductDetail;