import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    TextField,
    Button,
    Grid,
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    InputAdornment,
    Switch,
    FormControlLabel
} from '@mui/material';
import { useService } from '../../contexts/ServiceContext';
import { ImageUpload } from '../common/ImageUpload';
import styled from 'styled-components';
import OptimizedImage from '../common/OptimizedImage';

const StyledPaper = styled(Paper)`
    padding: 24px;
    margin-bottom: 24px;
`;

const ProductForm = ({ initialData, onSubmit }) => {
    const { categories } = useService();
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        shortDescription: '',
        price: {
            regular: '',
            sale: ''
        },
        category: '',
        stock: {
            quantity: 0,
            sku: '',
            manageStock: true
        },
        status: 'draft',
        images: [],
        ...initialData
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleImageUpload = (images) => {
        setFormData(prev => ({
            ...prev,
            images: images.map((img, index) => ({
                url: img,
                alt: formData.name,
                isMain: index === 0
            }))
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit}>
            <StyledPaper>
                <Typography variant="h6" gutterBottom>
                    Basic Information
                </Typography>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Product Name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Short Description"
                            name="shortDescription"
                            value={formData.shortDescription}
                            onChange={handleInputChange}
                            multiline
                            rows={2}
                            required
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Full Description"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            multiline
                            rows={4}
                            required
                        />
                    </Grid>
                </Grid>
            </StyledPaper>

            <StyledPaper>
                <Typography variant="h6" gutterBottom>
                    Pricing & Inventory
                </Typography>
                <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Regular Price"
                            name="price.regular"
                            type="number"
                            value={formData.price.regular}
                            onChange={handleInputChange}
                            InputProps={{
                                startAdornment: <InputAdornment position="start">£</InputAdornment>,
                            }}
                            required
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Sale Price"
                            name="price.sale"
                            type="number"
                            value={formData.price.sale}
                            onChange={handleInputChange}
                            InputProps={{
                                startAdornment: <InputAdornment position="start">£</InputAdornment>,
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="SKU"
                            name="stock.sku"
                            value={formData.stock.sku}
                            onChange={handleInputChange}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Stock Quantity"
                            name="stock.quantity"
                            type="number"
                            value={formData.stock.quantity}
                            onChange={handleInputChange}
                            required
                        />
                    </Grid>
                </Grid>
            </StyledPaper>

            <StyledPaper>
                <Typography variant="h6" gutterBottom>
                    Images
                </Typography>
                <ImageUpload
                    multiple
                    initialImages={formData.images.map(img => img.url)}
                    onUpload={handleImageUpload}
                />
            </StyledPaper>

            <div className="image-preview">
                {formData.images?.map((image, index) => (
                    <div key={index} className="preview-item">
                        <OptimizedImage
                            src={image.url}
                            alt={`Product preview ${index + 1}`}
                            width={200}
                            height={200}
                            className="preview-image"
                        />
                    </div>
                ))}
            </div>

            <Box display="flex" justifyContent="flex-end" mt={3}>
                <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    size="large"
                >
                    {initialData ? 'Update Product' : 'Create Product'}
                </Button>
            </Box>
        </form>
    );
};

export default ProductForm; 