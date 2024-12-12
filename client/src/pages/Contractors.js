import React from 'react';
import styled from 'styled-components';
import { Card } from '../styles/components/Card.styles';

const ContractorsContainer = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
`;

const ContractorsList = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.md};
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
`;

const Contractors = () => {
  return (
    <ContractorsContainer>
      <h1>Available Contractors</h1>
      <ContractorsList>
        {/* Contractor listings will go here */}
      </ContractorsList>
    </ContractorsContainer>
  );
};

export default Contractors; 