import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Paper, Button, MobileStepper } from '@mui/material';
import { KeyboardArrowLeft, KeyboardArrowRight } from '@mui/icons-material';
import SwipeableViews from 'react-swipeable-views';
import { autoPlay } from 'react-swipeable-views-utils';
import styled from 'styled-components';
import { fetchData, endpoints } from '../services/api';

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

  // Fetch the latest leads
  useEffect(() => {
    const fetchLatestLeads = async () => {
      try {
        const response = await fetchData(endpoints.leads.latest);
        setLeads(response.data);
      } catch (error) {
        console.error('Error fetching latest leads:', error);
      }
    };

    fetchLatestLeads();
    // Refresh leads every 5 minutes
    const interval = setInterval(fetchLatestLeads, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleNext = () => {
    setActiveStep((prevStep) => (prevStep + 1) % leads.length);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => (prevStep - 1 + leads.length) % leads.length);
  };

  const handleStepChange = (step) => {
    setActiveStep(step);
  };

  const handleViewLead = (leadId) => {
    navigate(`/leads/${leadId}`);
  };

  if (leads.length === 0) {
    return null; // Or a loading state
  }

  return (
    <CarouselContainer elevation={3}>
      <AutoPlaySwipeableViews
        axis="x"
        index={activeStep}
        onChangeIndex={handleStepChange}
        enableMouseEvents
        interval={6000}
      >
        {leads.map((lead, index) => (
          <div key={lead._id}>
            {Math.abs(activeStep - index) <= 2 ? (
              <SlideContent>
                <div>
                  <LeadTitle>{lead.title}</LeadTitle>
                  <LeadDescription>
                    {lead.description.substring(0, 150)}
                    {lead.description.length > 150 ? '...' : ''}
                  </LeadDescription>
                  <LeadMeta>
                    <span>Budget: ${lead.budget}</span>
                    <span>Posted: {new Date(lead.createdAt).toLocaleDateString()}</span>
                  </LeadMeta>
                </div>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleViewLead(lead._id)}
                  sx={{ alignSelf: 'flex-end', mt: 2 }}
                >
                  View Details
                </Button>
              </SlideContent>
            ) : null}
          </div>
        ))}
      </AutoPlaySwipeableViews>
      <MobileStepper
        steps={leads.length}
        position="static"
        activeStep={activeStep}
        nextButton={
          <Button size="small" onClick={handleNext}>
            Next <KeyboardArrowRight />
          </Button>
        }
        backButton={
          <Button size="small" onClick={handleBack}>
            <KeyboardArrowLeft /> Back
          </Button>
        }
      />
    </CarouselContainer>
  );
};

export default SimpleCarousel; 