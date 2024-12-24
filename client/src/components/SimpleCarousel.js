import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Paper, Button, MobileStepper } from '@mui/material';
import { KeyboardArrowLeft, KeyboardArrowRight } from '@mui/icons-material';
import styled from 'styled-components';
import api, { endpoints } from '../services/api';

const AutoPlaySwipeableViews = autoPlay(SwipeableViews);

const CarouselContainer = styled(Paper)`
  max-width: 800px;
  margin: 0 auto;
  position: relative;
  overflow: hidden;
  border-radius: 8px;
`;

const SlideContent = styled.div`
  padding: 20px;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
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

const SimpleCarousel = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [leads, setLeads] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLatestLeads = async () => {
      try {
        const response = await api.get(endpoints.leads.latest);
        console.log('Latest leads response:', response);
        
        const leadsArray = Array.isArray(response.data) ? response.data : 
                         response.data?.leads ? response.data.leads : [];
        
        setLeads(leadsArray);
      } catch (error) {
        console.error('Error fetching latest leads:', error);
        setLeads([]);
      }
    };

    fetchLatestLeads();
    const interval = setInterval(fetchLatestLeads, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (leads.length === 0) {
    return null;
  }

  const handleNext = () => {
    setActiveStep((prevStep) => (prevStep + 1) % leads.length);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => (prevStep - 1 + leads.length) % leads.length);
  };

  const handleViewLead = (leadId) => {
    navigate(`/leads/${leadId}`);
  };

  const currentLead = leads[activeStep];
  if (!currentLead) return null;

  return (
    <CarouselContainer elevation={3}>
      <SlideContent>
        <div>
          <LeadTitle>{currentLead.title}</LeadTitle>
          <LeadDescription>
            {currentLead.description?.substring(0, 150)}
            {currentLead.description?.length > 150 ? '...' : ''}
          </LeadDescription>
          <LeadMeta>
            <span>
              Budget: ${currentLead.budget?.min || 0} - ${currentLead.budget?.max || 0}
            </span>
            <span>
              Posted: {new Date(currentLead.createdAt).toLocaleDateString()}
            </span>
          </LeadMeta>
        </div>
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