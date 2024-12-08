import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'react-feather';
import { SkeletonCard } from './LoadingSkeleton';
import { fetchData, endpoints } from '../services/api';
import { useNotification } from '../contexts/NotificationContext';

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

const JobsWrapper = styled.div`
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

const JobCard = styled(Link)`
  background: ${({ theme }) => theme.colors.background.paper};
  padding: ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.borderRadius.md};
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
    background-color: var(--primary-color, ${({ theme }) => theme.colors.primary.main});
    color: ${({ theme }) => theme.colors.primary.text};
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
  background-color: ${props => props.$active ? 'var(--primary-color)' : '#ddd'};
  transition: background-color 0.3s ease;

  @media (max-width: 768px) {
    width: 6px;
    height: 6px;
  }
`;

const ErrorMessage = styled.div`
  color: ${({ theme }) => theme.colors.error};
  font-size: 1.2rem;
  text-align: center;
  margin-top: 20px;
`;

const JobDetails = styled.div`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 0.9em;

  h3 {
    color: ${({ theme }) => theme.colors.primary.main};
    margin-bottom: ${({ theme }) => theme.spacing.sm};
    font-size: 1.2rem;
    font-weight: 500;
  }

  p {
    margin: 5px 0;
  }
`;

function JobCarousel() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);
  const wrapperRef = useRef(null);
  const { error: notify } = useNotification();

  const scroll = useCallback((direction) => {
    if (!wrapperRef.current) return;
    
    const scrollAmount = 300;
    const currentScroll = wrapperRef.current.scrollLeft;
    const newScroll = direction === 'left' 
      ? currentScroll - scrollAmount 
      : currentScroll + scrollAmount;
    
    wrapperRef.current.scrollTo({
      left: newScroll,
      behavior: 'smooth'
    });

    const itemWidth = 300;
    const newIndex = Math.round(newScroll / itemWidth) % jobs.length;
    setCurrentIndex(newIndex >= 0 ? newIndex : 0);
  }, [jobs.length]);

  const handleTouchStart = useCallback((e) => {
    setTouchStart(e.touches[0].clientX);
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (!touchStart) return;

    const currentTouch = e.touches[0].clientX;
    const diff = touchStart - currentTouch;

    if (Math.abs(diff) > 50) {
      scroll(diff > 0 ? 'right' : 'left');
      setTouchStart(null);
    }
  }, [touchStart, scroll]);

  const handleTouchEnd = useCallback(() => {
    setTouchStart(null);
  }, []);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetchData(endpoints.jobs.featured);
        setJobs(response.data);
      } catch (err) {
        console.error('Error fetching jobs:', err);
        notify('Failed to load jobs');
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [notify]);

  useEffect(() => {
    if (!autoScrollEnabled) return;

    const interval = setInterval(() => {
      scroll('right');
    }, 5000);

    return () => clearInterval(interval);
  }, [autoScrollEnabled, scroll]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'ArrowLeft') scroll('left');
      if (e.key === 'ArrowRight') scroll('right');
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [scroll]);

  if (loading) {
    return (
      <CarouselContainer>
        <JobsWrapper>
          {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
        </JobsWrapper>
      </CarouselContainer>
    );
  }

  if (error) {
    return (
      <CarouselContainer>
        <ErrorMessage>Unable to load jobs. Please try again later.</ErrorMessage>
      </CarouselContainer>
    );
  }

  return (
    <CarouselContainer>
      <ScrollButton 
        direction="left" 
        onClick={() => scroll('left')}
        aria-label="Previous job"
      >
        <ChevronLeft />
      </ScrollButton>
      <JobsWrapper
        ref={wrapperRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {jobs.map((job, index) => (
          <JobCard 
            key={job._id}
            to={`/jobs/${job._id}`}
            onMouseEnter={() => setAutoScrollEnabled(false)}
            onMouseLeave={() => setAutoScrollEnabled(true)}
          >
            <JobDetails>
              <h3>{job.title}</h3>
              <p>{job.company}</p>
              <p>{job.location}</p>
            </JobDetails>
          </JobCard>
        ))}
      </JobsWrapper>
      <ScrollButton 
        direction="right" 
        onClick={() => scroll('right')}
        aria-label="Next job"
      >
        <ChevronRight />
      </ScrollButton>
      <ProgressIndicator>
        {jobs.map((_, index) => (
          <ProgressDot 
            key={index} 
            $active={index === currentIndex}
          />
        ))}
      </ProgressIndicator>
    </CarouselContainer>
  );
}

export default JobCarousel;
