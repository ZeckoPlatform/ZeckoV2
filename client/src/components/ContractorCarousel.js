import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'react-feather';
import { SkeletonCard } from './LoadingSkeleton';

const slideIn = keyframes`
  from { transform: translateX(20px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

const CarouselContainer = styled.div`
  position: relative;
  padding: 20px;
  margin: 20px 0;
  overflow: hidden;
  
  @media (max-width: 768px) {
    padding: 10px;
  }
`;

const ContractorsWrapper = styled.div`
  display: flex;
  gap: 20px;
  overflow-x: auto;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  -ms-overflow-style: none;
  padding: 10px 40px;
  touch-action: pan-x;
  scroll-snap-type: x mandatory;
  
  &::-webkit-scrollbar {
    display: none;
  }

  @media (max-width: 768px) {
    gap: 15px;
    padding: 5px 20px;
  }
`;

const ContractorCard = styled(Link)`
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  min-width: 300px;
  text-decoration: none;
  color: inherit;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  animation: ${slideIn} 0.3s ease;
  scroll-snap-align: start;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  }

  @media (max-width: 768px) {
    min-width: 250px;
    padding: 15px;
  }
`;

const ScrollButton = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  ${props => props.direction === 'left' ? 'left: 0;' : 'right: 0;'}
  background-color: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  z-index: 2;
  transition: all 0.3s ease;

  &:hover {
    background-color: var(--primary-color);
    color: white;
  }

  @media (max-width: 768px) {
    width: 30px;
    height: 30px;
    svg {
      width: 16px;
      height: 16px;
    }
  }
`;

const ProgressIndicator = styled.div`
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 15px;

  @media (max-width: 768px) {
    gap: 6px;
  }
`;

const ProgressDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${props => props.active ? 'var(--primary-color)' : '#ddd'};
  transition: background-color 0.3s ease;

  @media (max-width: 768px) {
    width: 6px;
    height: 6px;
  }
`;

export function ContractorCarousel() {
  const [contractors, setContractors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);
  const wrapperRef = useRef(null);
  const autoScrollRef = useRef(null);

  // Infinite scroll setup
  const getInfiniteContractors = useCallback(() => {
    if (contractors.length < 3) return contractors;
    return [...contractors.slice(-1), ...contractors, ...contractors.slice(0, 1)];
  }, [contractors]);

  // Accessibility announcement
  const announceSlide = useCallback((index) => {
    const announcement = `Showing contractor ${index + 1} of ${contractors.length}`;
    if (window.announceToScreenReader) {
      window.announceToScreenReader(announcement);
    }
  }, [contractors.length]);

  // Enhanced scroll function with infinite scroll support
  const scroll = useCallback((direction) => {
    if (wrapperRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      const { scrollLeft, scrollWidth, clientWidth } = wrapperRef.current;
      
      let newIndex = direction === 'left' 
        ? currentIndex - 1 
        : currentIndex + 1;

      // Handle infinite scroll
      if (newIndex < 0) {
        newIndex = contractors.length - 1;
        wrapperRef.current.scrollLeft = scrollWidth - clientWidth * 2;
      } else if (newIndex >= contractors.length) {
        newIndex = 0;
        wrapperRef.current.scrollLeft = 0;
      } else {
        wrapperRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }

      setCurrentIndex(newIndex);
      announceSlide(newIndex);
    }
  }, [currentIndex, contractors.length, announceSlide]);

  // Fetch contractors
  useEffect(() => {
    const fetchContractors = async () => {
      try {
        const response = await fetch('/api/contractors/featured');
        if (!response.ok) throw new Error('Failed to fetch contractors');
        
        const data = await response.json();
        setContractors(data.contractors || []);
      } catch (error) {
        console.error('Error fetching contractors:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchContractors();
  }, []);

  // Auto-scroll functionality
  useEffect(() => {
    if (autoScrollEnabled && contractors.length > 0) {
      autoScrollRef.current = setInterval(() => {
        scroll('right');
      }, 5000);
    }
    return () => clearInterval(autoScrollRef.current);
  }, [currentIndex, contractors.length, autoScrollEnabled]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'ArrowLeft') scroll('left');
      if (e.key === 'ArrowRight') scroll('right');
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Touch handlers
  const handleTouchStart = (e) => {
    setTouchStart(e.touches[0].clientX);
    setAutoScrollEnabled(false);
  };

  const handleTouchMove = (e) => {
    if (!touchStart) return;

    const touchEnd = e.touches[0].clientX;
    const diff = touchStart - touchEnd;

    if (Math.abs(diff) > 50) {
      scroll(diff > 0 ? 'right' : 'left');
      setTouchStart(null);
    }
  };

  const handleTouchEnd = () => {
    setTouchStart(null);
    setAutoScrollEnabled(true);
  };

  if (loading) {
    return (
      <CarouselContainer>
        <SectionTitle>Featured Contractors</SectionTitle>
        <ContractorsWrapper>
          {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
        </ContractorsWrapper>
      </CarouselContainer>
    );
  }

  if (error) {
    return (
      <CarouselContainer>
        <SectionTitle>Featured Contractors</SectionTitle>
        <ContractorCard as="div">
          <ContractorName>Unable to load contractors</ContractorName>
          <ContractorInfo>Please try again later</ContractorInfo>
        </ContractorCard>
      </CarouselContainer>
    );
  }

  return (
    <CarouselContainer
      role="region"
      aria-label="Featured Contractors Carousel"
    >
      <SectionTitle id="carousel-title">Featured Contractors</SectionTitle>
      <ScrollButton 
        direction="left" 
        onClick={() => scroll('left')}
        aria-label="Previous contractor"
      >
        <ChevronLeft />
      </ScrollButton>
      <ContractorsWrapper
        ref={wrapperRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        role="list"
        aria-labelledby="carousel-title"
      >
        {getInfiniteContractors().map((contractor, index) => (
          <ContractorCard 
            key={`${contractor._id}-${index}`}
            to={`/contractors/${contractor._id}`}
            onMouseEnter={() => setAutoScrollEnabled(false)}
            onMouseLeave={() => setAutoScrollEnabled(true)}
            role="listitem"
            aria-label={`${contractor.businessName}, ${contractor.specialty}`}
          >
            <ContractorName>{contractor.businessName}</ContractorName>
            <ContractorInfo>
              <p><strong>Specialty:</strong> {contractor.specialty}</p>
              <p><strong>Location:</strong> {contractor.location}</p>
              <p>{contractor.description?.substring(0, 100)}...</p>
            </ContractorInfo>
          </ContractorCard>
        ))}
      </ContractorsWrapper>
      <ScrollButton 
        direction="right" 
        onClick={() => scroll('right')}
        aria-label="Next contractor"
      >
        <ChevronRight />
      </ScrollButton>
      <ProgressIndicator role="tablist" aria-label="Carousel progress">
        {contractors.map((_, index) => (
          <ProgressDot 
            key={index} 
            active={index === currentIndex}
            role="tab"
            aria-selected={index === currentIndex}
            aria-label={`Slide ${index + 1} of ${contractors.length}`}
          />
        ))}
      </ProgressIndicator>
    </CarouselContainer>
  );
}
