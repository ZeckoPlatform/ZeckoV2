import React from 'react';
import styled from 'styled-components';

const JobsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
  padding: ${({ theme }) => theme.spacing.lg};
`;

const JobCard = styled.div`
  background: ${({ theme }) => theme.colors.background.paper};
  padding: ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  
  h3 {
    color: var(--primary-color, ${({ theme }) => theme.colors.primary.main});
    margin-bottom: ${({ theme }) => theme.spacing.sm};
  }
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
