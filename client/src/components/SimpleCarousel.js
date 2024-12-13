import React, { useState } from 'react';
import styled from 'styled-components';
import { ChevronLeft, ChevronRight } from 'react-feather';
import { Link } from 'react-router-dom';

const CarouselContainer = styled.div`
  position: relative;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const ItemCard = styled(Link)`
  background: white;
  padding: 20px;
  border-radius: 8px;
  text-decoration: none;
  color: inherit;
  display: block;
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-5px);
  }
`;

const Title = styled.h3`
  color: ${({ theme }) => theme.colors.primary.main};
  margin-bottom: 10px;
`;

const Description = styled.p`
  color: #666;
`;

const Button = styled.button`
  background: ${({ theme }) => theme.colors.primary.main};
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  margin: 0 5px;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SimpleCarousel = ({ items = [], type = 'item' }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // If no items, show placeholder
  if (!items?.length) {
    return (
      <CarouselContainer>
        <Description>No {type}s available at the moment.</Description>
      </CarouselContainer>
    );
  }

  const currentItem = items[currentIndex];

  const handlePrevious = () => {
    setCurrentIndex(current => 
      current > 0 ? current - 1 : items.length - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex(current => 
      current < items.length - 1 ? current + 1 : 0
    );
  };

  return (
    <CarouselContainer>
      <ItemCard to={`/${type}s/${currentItem._id}`}>
        <Title>{currentItem.name || currentItem.title}</Title>
        <Description>
          {currentItem.description || `${type} details`}
        </Description>
      </ItemCard>
      
      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <Button 
          onClick={handlePrevious}
          disabled={items.length <= 1}
        >
          <ChevronLeft size={16} />
        </Button>
        <Button 
          onClick={handleNext}
          disabled={items.length <= 1}
        >
          <ChevronRight size={16} />
        </Button>
      </div>
      
      <div style={{ textAlign: 'center', marginTop: '10px' }}>
        {currentIndex + 1} / {items.length}
      </div>
    </CarouselContainer>
  );
};

export default SimpleCarousel; 