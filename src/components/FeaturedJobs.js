import React from 'react';
import styled from 'styled-components';

const JobsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  padding: 20px;
`;

const JobCard = styled.div`
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

export function FeaturedJobs() {
  return (
    <JobsContainer>
      <JobCard>
        <h3>Featured Job</h3>
        <p>Sample job listing</p>
      </JobCard>
    </JobsContainer>
  );
}
