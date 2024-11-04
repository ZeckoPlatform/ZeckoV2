import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { JobCarousel } from '../components/JobCarousel';
import JobListing from '../components/JobListing';
import JobPostForm from '../components/JobPostForm';
import JobSearch from '../components/JobSearch';

const DashboardContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

const DashboardHeader = styled.h1`
  color: var(--primary-color);
  margin-bottom: 30px;
  font-size: 2.5rem;
  font-weight: 600;
`;

const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 25px;
  margin-bottom: 40px;
`;

const DashboardCard = styled.div`
  background: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  }
`;

const CardHeader = styled.h2`
  color: var(--primary-color);
  margin-bottom: 15px;
  font-size: 1.5rem;
  font-weight: 500;
`;

const WelcomeText = styled.p`
  font-size: 1.1rem;
  color: #666;
  margin-bottom: 20px;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`;

const Button = styled.button`
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.2s ease;
  flex: 1;
  min-width: 120px;
  max-width: 200px;

  &:hover {
    opacity: 0.9;
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const TabContainer = styled.div`
  background: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-top: 30px;
`;

const TabButtons = styled.div`
  display: flex;
  gap: 15px;
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 2px solid #eee;
`;

const TabButton = styled.button`
  padding: 12px 24px;
  background-color: ${props => props.active ? 'var(--primary-color)' : '#f5f5f5'};
  color: ${props => props.active ? 'white' : '#666'};
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    opacity: 0.9;
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const ContentSection = styled.div`
  margin-top: 20px;
`;

function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('jobs');
  const [showPostForm, setShowPostForm] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('/api/dashboard', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }
        const data = await response.json();
        setDashboardData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleJobPosted = (newJob) => {
    setShowPostForm(false);
    // Optionally refresh job listings
    setActiveTab('jobs');
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <DashboardContainer>
      <DashboardHeader>Dashboard</DashboardHeader>
      <DashboardGrid>
        <DashboardCard>
          <CardHeader>Profile Overview</CardHeader>
          <WelcomeText>Welcome back, {user?.username}</WelcomeText>
          <ButtonContainer>
            <Button onClick={() => navigate('/shop')}>Start Shopping</Button>
            <Button onClick={() => setShowPostForm(!showPostForm)}>
              {showPostForm ? 'Cancel Post' : 'Post a Job'}
            </Button>
          </ButtonContainer>
        </DashboardCard>

        <DashboardCard>
          <CardHeader>Recent Activity</CardHeader>
          {/* Add recent activity information */}
        </DashboardCard>

        <DashboardCard>
          <CardHeader>Statistics</CardHeader>
          {/* Add statistics information */}
        </DashboardCard>
      </DashboardGrid>

      <TabContainer>
        <TabButtons>
          <TabButton 
            active={activeTab === 'jobs'} 
            onClick={() => setActiveTab('jobs')}
          >
            Job Listings
          </TabButton>
          <TabButton 
            active={activeTab === 'search'} 
            onClick={() => setActiveTab('search')}
          >
            Search Jobs
          </TabButton>
        </TabButtons>

        <ContentSection>
          {showPostForm && (
            <JobPostForm onJobPosted={handleJobPosted} />
          )}

          <JobCarousel />

          {activeTab === 'jobs' ? (
            <JobListing />
          ) : (
            <JobSearch />
          )}
        </ContentSection>
      </TabContainer>
    </DashboardContainer>
  );
}

export default Dashboard;
