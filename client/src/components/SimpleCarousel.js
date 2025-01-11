import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Paper, Button, MobileStepper, Typography, Box } from '@mui/material';
import { KeyboardArrowLeft, KeyboardArrowRight } from '@mui/icons-material';
import styled from 'styled-components';
import leadService from '../services/leadService';

const CarouselContainer = styled(Paper)`
  max-width: 800px;
  margin: 0 auto;
  position: relative;
  overflow: hidden;
  border-radius: 8px;
  touch-action: pan-y pinch-zoom;
`;

const SlideContent = styled.div`
  padding: 20px;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  cursor: grab;
  &:active {
    cursor: grabbing;
  }
`;

const LeadTitle = styled(Typography)`
  margin-bottom: 1rem;
  color: ${({ theme }) => theme.colors?.primary?.main || '#2962ff'};
`;

const LeadDescription = styled(Typography)`
  margin-bottom: 1rem;
  color: ${({ theme }) => theme.colors?.text?.secondary || '#666'};
`;

const LeadMeta = styled(Box)`
  display: flex;
  justify-content: space-between;
  color: ${({ theme }) => theme.colors?.text?.secondary || '#666'};
  margin-bottom: 1rem;
`;

const SimpleCarousel = () => {
  const [items, setItems] = useState([]);
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLatestLeads = async () => {
      try {
        const latestLeads = await leadService.getLatestLeads();
        setItems(latestLeads);
      } catch (err) {
        setError('Failed to fetch latest leads');
        console.error('Error fetching leads:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestLeads();
  }, []);

  const handleNext = () => {
    setActiveStep((prevStep) => (prevStep + 1) % items.length);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => (prevStep - 1 + items.length) % items.length);
  };

  const handleViewItem = useCallback((e, id) => {
    e.preventDefault();
    navigate(`/leads/${id}`);
  }, [navigate]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (items.length === 0) return null;

  const currentItem = items[activeStep];

  const renderItemContent = (item) => {
    if (!item) return null;

    const locationString = item.location?.city 
      ? `${item.location.city}${item.location.state ? `, ${item.location.state}` : ''}`
      : '';

    return (
      <>
        <LeadTitle variant="h5">{item.title}</LeadTitle>
        <LeadDescription variant="body1">{item.description}</LeadDescription>
        <LeadMeta>
          <Typography variant="body2">
            {locationString}
          </Typography>
          <Typography variant="body2">
            Budget: £{item.budget?.min?.toLocaleString()} - £{item.budget?.max?.toLocaleString()}
          </Typography>
        </LeadMeta>
      </>
    );
  };

  return (
    <CarouselContainer elevation={3}>
      <SlideContent>
        {renderItemContent(currentItem)}
        <Button
          variant="contained"
          color="primary"
          onClick={(e) => handleViewItem(e, currentItem._id)}
          sx={{ alignSelf: 'flex-end', mt: 2 }}
        >
          View Details
        </Button>
      </SlideContent>
      <MobileStepper
        steps={items.length}
        position="static"
        activeStep={activeStep}
        nextButton={
          <Button 
            size="small" 
            onClick={handleNext}
            disabled={items.length <= 1}
          >
            Next <KeyboardArrowRight />
          </Button>
        }
        backButton={
          <Button 
            size="small" 
            onClick={handleBack}
            disabled={items.length <= 1}
          >
            <KeyboardArrowLeft /> Back
          </Button>
        }
      />
    </CarouselContainer>
  );
};

export default SimpleCarousel; 