import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Spinner from './Spinner';

const CarouselContainer = styled.div`
  position: relative;
  width: 100%;
  overflow: hidden;
  margin: 20px 0;
`;

const CarouselTrack = styled.div`
  display: flex;
  transition: transform 0.5s ease-in-out;
  transform: translateX(-${props => props.currentIndex * 100}%);
`;

const JobCard = styled.div`
  flex: 0 0 100%;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin: 0 10px;
`;

const NavigationButton = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: var(--primary-color);
  color: white;
  border: none;
  padding: 10px;
  cursor: pointer;
  z-index: 2;
  border-radius: 50%;
  
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
  
  &.prev { left: 10px; }
  &.next { right: 10px; }
`;

function JobCarousel() {
  const [jobs, setJobs] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Simulated data until backend is ready
    const mockJobs = [
      {
        id: 1,
        title: "Kitchen Renovation",
        description: "Complete kitchen remodeling project",
        budget: "15,000",
        location: "New York, NY"
      },
      {
        id: 2,
        title: "Bathroom Remodel",
        description: "Modern bathroom renovation needed",
        budget: "8,000",
        location: "Los Angeles, CA"
      },
      {
        id: 3,
        title: "Deck Construction",
        description: "Build a new wooden deck",
        budget: "5,000",
        location: "Chicago, IL"
      }
    ];
    
    setJobs(mockJobs);
    setLoading(false);
  }, []);

  const nextSlide = () => {
    setCurrentIndex(current => 
      current === jobs.length - 1 ? 0 : current + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex(current => 
      current === 0 ? jobs.length - 1 : current - 1
    );
  };

  if (loading) return <Spinner />;
  if (error) return <div>Error: {error}</div>;
  if (jobs.length === 0) return <div>No jobs available</div>;

  return (
    <CarouselContainer>
      <NavigationButton 
        className="prev" 
        onClick={prevSlide}
        disabled={currentIndex === 0}
      >
        ←
      </NavigationButton>
      
      <CarouselTrack currentIndex={currentIndex}>
        {jobs.map(job => (
          <JobCard key={job.id}>
            <h3>{job.title}</h3>
            <p>{job.description}</p>
            <p>Budget: ${job.budget}</p>
            <p>Location: {job.location}</p>
          </JobCard>
        ))}
      </CarouselTrack>
      
      <NavigationButton 
        className="next" 
        onClick={nextSlide}
        disabled={currentIndex === jobs.length - 1}
      >
        →
      </NavigationButton>
    </CarouselContainer>
  );
}

export default JobCarousel;
