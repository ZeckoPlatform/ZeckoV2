import React from 'react';
import { Grid, Card, CardContent, CardMedia, Typography, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useService } from '../../contexts/ServiceContext';
import styled from 'styled-components';

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
        <Grid container spacing={3} padding={3}>
            {categories.map((category) => (
                <Grid item xs={12} sm={6} md={4} key={category._id}>
                    <StyledCard onClick={() => handleCategoryClick(category._id)}>
                        <CategoryImage
                            image={category.icon || '/default-category.jpg'}
                            title={category.name}
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
                </Grid>
            ))}
        </Grid>
    );
};

export default CategoryList; 