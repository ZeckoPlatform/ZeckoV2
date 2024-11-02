import React from 'react';
import styled from 'styled-components';

const CarouselContainer = styled.div`
  padding: 20px;
  margin: 20px 0;
`;

const JobCard = styled.div`
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin: 10px;
`;

export function JobCarousel() {
  return (
    <CarouselContainer>
      <JobCard>
        <h3>Featured Job</h3>
        <p>Sample job description</p>
      </JobCard>
    </CarouselContainer>
  );
}
