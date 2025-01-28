import styled from 'styled-components';
import { cardStyle, glassEffect } from '../styles/mixins';
import React from 'react';
import OptimizedImage from './common/OptimizedImage';

const JobCardContainer = styled.div`
  ${cardStyle};
  ${glassEffect};
  padding: ${({ theme }) => theme.spacing.lg};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
  animation: ${slideUp} ${({ theme }) => theme.transitions.medium} ease-out;
`;

const JobHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

const JobTitle = styled.h3`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.size.xl};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const JobCompany = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.size.md};
`;

const JobSalary = styled.div`
  background: ${({ theme }) => `${theme.colors.primary.main}10`};
  color: ${({ theme }) => theme.colors.primary.main};
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.sm}`};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-weight: ${({ theme }) => theme.typography.weight.medium};
`;

const JobDetails = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.size.sm};
`;

const JobDescription = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.size.md};
  line-height: 1.6;
`;

const JobFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: ${({ theme }) => theme.spacing.md};
`;

const JobTags = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const JobTag = styled.span`
  background: ${({ theme }) => `${theme.colors.secondary.main}10`};
  color: ${({ theme }) => theme.colors.secondary.main};
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.sm}`};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: ${({ theme }) => theme.typography.size.sm};
`;

const LeadCard = ({ lead }) => {
  return (
    <CardContainer>
      {lead.image && (
        <OptimizedImage
          src={lead.image}
          alt={lead.title}
          width={300}
          height={200}
          className="lead-image"
        />
      )}
      {/* ... rest of your component ... */}
    </CardContainer>
  );
};

export default LeadCard; 