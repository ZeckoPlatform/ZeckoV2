import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { CircularProgress } from '@mui/material';
import { fetchData, endpoints } from '../services/api';

const ContractorsContainer = styled.div`
  text-align: center;
  padding: 2rem;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const SectionTitle = styled.h2`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.size.h2};
`;

function Contractors() {
  const [loading, setLoading] = useState(true);
  const [contractors, setContractors] = useState([]);

  useEffect(() => {
    const loadContractors = async () => {
      try {
        const response = await fetchData(endpoints.contractors.list);
        if (response.data) {
          setContractors(response.data);
        }
      } catch (error) {
        console.error('Error loading contractors:', error);
      } finally {
        setLoading(false);
      }
    };

    loadContractors();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
        <CircularProgress />
      </div>
    );
  }

  return (
    <ContractorsContainer>
      <SectionTitle>Available Contractors</SectionTitle>
      {/* Add contractor listing components here */}
    </ContractorsContainer>
  );
}

export default Contractors; 