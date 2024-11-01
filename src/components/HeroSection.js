import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

const HeroContainer = styled.section`
  background: linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)),
              url('/images/hero-bg.jpg') center/cover no-repeat;
  color: white;
  padding: 100px 20px;
  text-align: center;
  margin-bottom: 40px;
`;

const HeroContent = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const HeroTitle = styled.h1`
  font-size: 3em;
  margin-bottom: 20px;
  font-weight: bold;
`;

const HeroSubtitle = styled.p`
  font-size: 1.2em;
  margin-bottom: 30px;
  line-height: 1.6;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 20px;
  justify-content: center;
`;

const Button = styled(Link)`
  padding: 15px 30px;
  border-radius: 5px;
  font-size: 1.1em;
  text-decoration: none;
  transition: all 0.3s ease;
  font-weight: bold;
  cursor: pointer;

  &.primary {
    background-color: var(--primary-color);
    color: white;
    border: 2px solid var(--primary-color);

    &:hover {
      background-color: transparent;
      color: white;
    }
  }

  &.secondary {
    background-color: transparent;
    color: white;
    border: 2px solid white;

    &:hover {
      background-color: white;
      color: var(--primary-color);
    }
  }
`;

const SearchContainer = styled.div`
  margin-top: 40px;
  display: flex;
  justify-content: center;
  gap: 10px;
`;

const SearchInput = styled.input`
  padding: 15px;
  border-radius: 5px;
  border: none;
  width: 300px;
  font-size: 1em;
`;

const SearchButton = styled.button`
  padding: 15px 30px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1em;
  transition: opacity 0.3s ease;

  &:hover {
    opacity: 0.9;
  }
`;

function HeroSection() {
  const handleSearch = (e) => {
    e.preventDefault();
    // Implement search functionality
    console.log('Search clicked');
  };

  return (
    <HeroContainer>
      <HeroContent>
        <HeroTitle>Find the Perfect Contractor for Your Project</HeroTitle>
        <HeroSubtitle>
          Connect with skilled professionals and get your project done right.
          Browse thousands of verified contractors and find the perfect match for your needs.
        </HeroSubtitle>
        
        <ButtonContainer>
          <Button to="/post-job" className="primary">
            Post a Job
          </Button>
          <Button to="/browse-contractors" className="secondary">
            Browse Contractors
          </Button>
        </ButtonContainer>

        <SearchContainer>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px' }}>
            <SearchInput 
              type="text" 
              placeholder="Search for contractors or services..."
              aria-label="Search contractors"
            />
            <SearchButton type="submit">
              Search
            </SearchButton>
          </form>
        </SearchContainer>
      </HeroContent>
    </HeroContainer>
  );
}

export default HeroSection;
