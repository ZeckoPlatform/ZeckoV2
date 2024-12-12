import React from 'react';
import styled from 'styled-components';
import { Card } from '../styles/components/Card.styles';

const JobsContainer = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
`;

const JobsList = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.md};
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
`;

const Jobs = () => {
  return (
    <JobsContainer>
      <h1>Available Jobs</h1>
      <JobsList>
        {/* Job listings will go here */}
      </JobsList>
    </JobsContainer>
  );
};

export default Jobs; 