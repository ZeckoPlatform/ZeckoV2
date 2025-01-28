import React from 'react';
import { Grid, Card, CardContent, CardMedia, Typography, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useService } from '../../contexts/ServiceContext';
import styled from 'styled-components';
import OptimizedImage from '../common/OptimizedImage';

const StyledCard = styled(Card)`
  cursor: pointer;
  transition: transform 0.2s;
  height: 100%;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  }
`;

const CategoryImage = styled(CardMedia)`
  height: 160px;
  background-size: cover;
`;

const CategoryList = () => {
    const { categories, loading } = useService();
    const navigate = useNavigate();

    const handleCategoryClick = (categoryId) => {
        navigate(`/service-request/${categoryId}`);
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" p={4}>
                <Typography>Loading categories...</Typography>
            </Box>
        );
    }

    return (
        <div className="category-list">
            {categories.map((category, index) => (
                <div key={index} className="category-card">
                    <StyledCard onClick={() => handleCategoryClick(category._id)}>
                        <OptimizedImage
                            src={category.icon || category.image}
                            alt={category.name}
                            width={80}
                            height={80}
                            className="category-image"
                        />
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                {category.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {category.description}
                            </Typography>
                        </CardContent>
                    </StyledCard>
                </div>
            ))}
        </div>
    );
};

export default CategoryList; 