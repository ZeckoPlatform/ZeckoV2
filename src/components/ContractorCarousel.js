import React from 'react';
import styled from 'styled-components';

const CarouselContainer = styled.div`
  padding: 20px;
  margin: 20px 0;
`;

const ContractorCard = styled.div`
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin: 10px;
`;

function ContractorCarousel() {
  return (
    <CarouselContainer>
      <ContractorCard>
        <h3>Featured Contractor</h3>
        <p>Sample contractor profile</p>
      </ContractorCard>
    </CarouselContainer>
  );
}

export default ContractorCarousel;
