import styled from 'styled-components';
import { cardStyle, glassEffect } from '../styles/mixins';
import OptimizedImage from './common/OptimizedImage';
import React from 'react';

const ContractorCardContainer = styled.div`
  ${cardStyle};
  ${glassEffect};
  padding: ${({ theme }) => theme.spacing.lg};
  display: flex;
  gap: ${({ theme }) => theme.spacing.lg};
  animation: ${slideUp} ${({ theme }) => theme.transitions.medium} ease-out;
`;

const ContractorAvatar = styled.div`
  width: 80px;
  height: 80px;
  border-radius: ${({ theme }) => theme.borderRadius.round};
  overflow: hidden;
  flex-shrink: 0;
`;

const ContractorInfo = styled.div`
  flex: 1;
`;

const ContractorName = styled.h3`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.size.xl};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const ContractorSpecialty = styled.p`
  color: ${({ theme }) => theme.colors.primary.main};
  font-size: ${({ theme }) => theme.typography.size.md};
  font-weight: ${({ theme }) => theme.typography.weight.medium};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const ContractorStats = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const StatItem = styled.div`
  text-align: center;
`;

const StatValue = styled.div`
  font-size: ${({ theme }) => theme.typography.size.lg};
  font-weight: ${({ theme }) => theme.typography.weight.bold};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const StatLabel = styled.div`
  font-size: ${({ theme }) => theme.typography.size.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const ContractorCard = ({ contractor }) => {
  return (
    <ContractorCardContainer>
      <ContractorAvatar>
        <OptimizedImage
          src={contractor.avatar || '/default-avatar.png'}
          alt={contractor.name}
          width={80}
          height={80}
          className="contractor-avatar"
        />
      </ContractorAvatar>
      {/* ... rest of your component ... */}
    </ContractorCardContainer>
  );
};

export default ContractorCard; 