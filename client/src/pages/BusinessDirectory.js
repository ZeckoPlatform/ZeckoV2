import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const DirectoryContainer = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const SearchBar = styled.input`
  width: 100%;
  padding: 10px;
  margin-bottom: 20px;
  border: 1px solid #ddd;
  border-radius: 4px;
`;

const BusinessGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
`;

const BusinessCard = styled.div`
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  background: white;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  }
`;

const BusinessName = styled.h3`
  margin: 0 0 10px 0;
  color: var(--primary-color);
`;

const BusinessInfo = styled.div`
  font-size: 0.9em;
  color: #666;
`;

const BusinessDirectory = () => {
  const [businesses, setBusinesses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const fetchBusinesses = async () => {
    try {
      const response = await fetch('/api/businesses');
      if (!response.ok) {
        throw new Error('Failed to fetch businesses');
      }
      const data = await response.json();
      setBusinesses(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredBusinesses = businesses.filter(business =>
    business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    business.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <DirectoryContainer>
      <h1>Business Directory</h1>
      <SearchBar
        type="text"
        placeholder="Search businesses..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <BusinessGrid>
        {filteredBusinesses.map((business) => (
          <BusinessCard key={business._id}>
            <BusinessName>{business.name}</BusinessName>
            <BusinessInfo>
              <p><strong>Category:</strong> {business.category}</p>
              <p><strong>Location:</strong> {business.location}</p>
              <p><strong>Contact:</strong> {business.phone}</p>
              <p>{business.description}</p>
            </BusinessInfo>
          </BusinessCard>
        ))}
      </BusinessGrid>
    </DirectoryContainer>
  );
};

export default BusinessDirectory;
