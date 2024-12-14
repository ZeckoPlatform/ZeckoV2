import React, { useState } from 'react';
import styled from 'styled-components';
import { ChevronLeft, ChevronRight } from 'react-feather';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const CarouselContainer = styled.div`
  position: relative;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const ItemCard = styled(motion.div)`
  background: white;
  padding: 20px;
  border-radius: 8px;
  text-decoration: none;
  color: inherit;
`;

const StyledLink = styled(Link)`
  text-decoration: none;
  color: inherit;
`;

const Title = styled.h3`
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 10px;
`;

const Description = styled.p`
  color: #666;
`;

const Button = styled.button`
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  margin: 0 5px;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const Navigation = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
`;

const PageIndicator = styled.div`
  margin: 10px 0;
  text-align: center;
  color: ${({ theme }) => theme.colors.text};
`;

const SimpleCarousel = ({ items = [], type = 'item' }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

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
      <AnimatePresence mode='wait'>
        <ItemCard
          key={currentIndex}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
        >
          <StyledLink to={`/${type}s/${currentItem._id}`}>
            <Title>{currentItem.name || currentItem.title}</Title>
            <Description>
              {currentItem.description || `${type} details`}
            </Description>
          </StyledLink>
        </ItemCard>
      </AnimatePresence>

      <Navigation>
        <Button onClick={handlePrevious} disabled={items.length <= 1}>
          <ChevronLeft size={16} />
        </Button>
        <Button onClick={handleNext} disabled={items.length <= 1}>
          <ChevronRight size={16} />
        </Button>
      </Navigation>

      <PageIndicator>
        {currentIndex + 1} / {items.length}
      </PageIndicator>
    </CarouselContainer>
  );
};

export default SimpleCarousel; 