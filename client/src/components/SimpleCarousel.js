import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Paper, Button, MobileStepper, Typography, Box } from '@mui/material';
import { KeyboardArrowLeft, KeyboardArrowRight } from '@mui/icons-material';
import styled from 'styled-components';
import { leadService } from '../services/leadService';

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
  const [activeStep, setActiveStep] = useState(0);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const navigate = useNavigate();

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  const handleNext = useCallback(() => {
    setActiveStep((prevStep) => (prevStep + 1) % leads.length);
  }, [leads.length]);

  const handleBack = useCallback(() => {
    setActiveStep((prevStep) => (prevStep - 1 + leads.length) % leads.length);
  }, [leads.length]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === 'ArrowLeft') {
        handleBack();
      } else if (event.key === 'ArrowRight') {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleNext, handleBack]);

  // Handle touch events for swipe
  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      handleNext();
    } else if (isRightSwipe) {
      handleBack();
    }
  };

  // Add useEffect to fetch leads
  useEffect(() => {
    const fetchLeads = async () => {
      try {
        setLoading(true);
        const fetchedLeads = await leadService.getLatestLeads();
        console.log('Fetched leads:', fetchedLeads); // Debug log
        setLeads(fetchedLeads);
      } catch (error) {
        console.error('Error fetching leads:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, []);

  // Auto-play effect
  useEffect(() => {
    const autoPlay = setInterval(() => {
      handleNext();
    }, 6000);
    return () => clearInterval(autoPlay);
  }, [handleNext]);

  // Add loading and error states
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (leads.length === 0) return null;

  const handleViewLead = (leadId) => {
    navigate(`/leads/${leadId}`);
  };

  const currentLead = leads[activeStep];
  if (!currentLead) return null;

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
      <SlideContent
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {renderItemContent(currentLead)}
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleViewLead(currentLead._id)}
          sx={{ alignSelf: 'flex-end', mt: 2 }}
        >
          View Details
        </Button>
      </SlideContent>
      <MobileStepper
        steps={leads.length}
        position="static"
        activeStep={activeStep}
        nextButton={
          <Button 
            size="small" 
            onClick={handleNext}
            disabled={leads.length <= 1}
          >
            Next <KeyboardArrowRight />
          </Button>
        }
        backButton={
          <Button 
            size="small" 
            onClick={handleBack}
            disabled={leads.length <= 1}
          >
            <KeyboardArrowLeft /> Back
          </Button>
        }
      />
    </CarouselContainer>
  );
};

export default SimpleCarousel; 