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

const SectionTitle = styled.h2`
  color: var(--primary-color);
  margin-bottom: 20px;
  font-size: 1.8rem;

  @media (max-width: 768px) {
    font-size: 1.5rem;
    margin-bottom: 15px;
  }
`;

const JobTitle = styled.h3`
  color: var(--primary-color);
  margin-bottom: 10px;
  font-size: 1.2rem;
`;

const JobInfo = styled.div`
  color: #666;
  font-size: 0.9em;

  p {
    margin: 5px 0;
  }
`;

const ProgressIndicator = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 20px;
`;

const ProgressDot = styled.button`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: ${props => props.active ? 'var(--primary-color)' : '#ccc'};
  border: none;
  margin: 0 5px;
  cursor: pointer;
`;

export function JobCarousel() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);
  const wrapperRef = useRef(null);
  const autoScrollRef = useRef(null);

  // Infinite scroll setup
  const getInfiniteJobs = useCallback(() => {
    if (jobs.length < 3) return jobs;
    return [...jobs.slice(-1), ...jobs, ...jobs.slice(0, 1)];
  }, [jobs]);

  // Accessibility announcement
  const announceSlide = useCallback((index) => {
    const announcement = `Showing job ${index + 1} of ${jobs.length}`;
    if (window.announceToScreenReader) {
      window.announceToScreenReader(announcement);
    }
  }, [jobs.length]);

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
        newIndex = jobs.length - 1;
        wrapperRef.current.scrollLeft = scrollWidth - clientWidth * 2;
      } else if (newIndex >= jobs.length) {
        newIndex = 0;
        wrapperRef.current.scrollLeft = 0;
      } else {
        wrapperRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }

      setCurrentIndex(newIndex);
      announceSlide(newIndex);
    }
  }, [currentIndex, jobs.length, announceSlide]);

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

  // Auto-scroll functionality
  useEffect(() => {
    if (autoScrollEnabled && jobs.length > 0) {
      autoScrollRef.current = setInterval(() => {
        scroll('right');
      }, 5000);
    }
    return () => clearInterval(autoScrollRef.current);
  }, [currentIndex, jobs.length, autoScrollEnabled, scroll]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'ArrowLeft') scroll('left');
      if (e.key === 'ArrowRight') scroll('right');
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [scroll]);

  // Fetch jobs
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetch('/api/jobs/featured');
        if (!response.ok) throw new Error('Failed to fetch jobs');
        
        const data = await response.json();
        setJobs(data.jobs || []);
      } catch (error) {
        console.error('Error fetching jobs:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  if (loading) {
    return (
      <CarouselContainer>
        <SectionTitle>Featured Jobs</SectionTitle>
        <JobsWrapper>
          {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
        </JobsWrapper>
      </CarouselContainer>
    );
  }

  if (error) {
    return (
      <CarouselContainer>
        <SectionTitle>Featured Jobs</SectionTitle>
        <JobCard as="div">
          <JobTitle>Unable to load jobs</JobTitle>
          <JobInfo>Please try again later</JobInfo>
        </JobCard>
      </CarouselContainer>
    );
  }

  return (
    <CarouselContainer
      role="region"
      aria-label="Featured Jobs Carousel"
    >
      <SectionTitle id="jobs-carousel-title">Featured Jobs</SectionTitle>
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
        role="list"
        aria-labelledby="jobs-carousel-title"
      >
        {getInfiniteJobs().map((job, index) => (
          <JobCard 
            key={`${job._id}-${index}`}
            to={`/jobs/${job._id}`}
            onMouseEnter={() => setAutoScrollEnabled(false)}
            onMouseLeave={() => setAutoScrollEnabled(true)}
            role="listitem"
            aria-label={`${job.title} at ${job.company}`}
          >
            <JobTitle>{job.title}</JobTitle>
            <JobInfo>
              <p><strong>Company:</strong> {job.company}</p>
              <p><strong>Location:</strong> {job.location}</p>
              <p><strong>Salary:</strong> ${job.salary}</p>
              <p>{job.description?.substring(0, 100)}...</p>
            </JobInfo>
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
      <ProgressIndicator role="tablist" aria-label="Carousel progress">
        {jobs.map((_, index) => (
          <ProgressDot 
            key={index} 
            active={index === currentIndex}
            role="tab"
            aria-selected={index === currentIndex}
            aria-label={`Slide ${index + 1} of ${jobs.length}`}
          />
        ))}
      </ProgressIndicator>
    </CarouselContainer>
  );
}
