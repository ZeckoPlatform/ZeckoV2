import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Paper, Button, MobileStepper } from '@mui/material';
import { KeyboardArrowLeft, KeyboardArrowRight } from '@mui/icons-material';
import styled from 'styled-components';
import api, { endpoints } from '../services/api';

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

const LeadTitle = styled.h3`
  margin: 0 0 10px;
  color: ${({ theme }) => theme.colors?.primary?.main || '#2962ff'};
`;

const LeadDescription = styled.p`
  margin: 0 0 15px;
  color: ${({ theme }) => theme.colors?.text?.secondary || '#666'};
`;

const LeadMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: ${({ theme }) => theme.colors?.text?.secondary || '#666'};
  font-size: 0.9em;
`;

const SimpleCarousel = ({ items, type }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const navigate = useNavigate();

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  const handleNext = useCallback(() => {
    setActiveStep((prevStep) => (prevStep + 1) % items.length);
  }, [items.length]);

  const handleBack = useCallback(() => {
    setActiveStep((prevStep) => (prevStep - 1 + items.length) % items.length);
  }, [items.length]);

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

  // Auto-play effect
  useEffect(() => {
    const autoPlay = setInterval(() => {
      handleNext();
    }, 6000);
    return () => clearInterval(autoPlay);
  }, [handleNext]);

  if (!items || items.length === 0) {
    return null;
  }

  const currentItem = items[activeStep];
  if (!currentItem) return null;

  const handleViewLead = (leadId) => {
    navigate(`/leads/${leadId}`);
  };

  return (
    <CarouselContainer elevation={3}>
      <SlideContent
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div>
          <LeadTitle>{currentItem.title}</LeadTitle>
          <LeadDescription>
            {currentItem.description?.substring(0, 150)}
            {currentItem.description?.length > 150 ? '...' : ''}
          </LeadDescription>
          <LeadMeta>
            <span>
              Budget: ${currentItem.budget?.min || 0} - ${currentItem.budget?.max || 0}
            </span>
            <span>
              Posted: {new Date(currentItem.createdAt).toLocaleDateString()}
            </span>
          </LeadMeta>
        </div>
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleViewLead(currentItem._id)}
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