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

const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
`;

const DashboardCard = styled.div`
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const Button = styled.button`
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 10px;

  &:hover {
    opacity: 0.9;
  }
`;

const TabContainer = styled.div`
  margin-top: 20px;
`;

const TabButtons = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
`;

const TabButton = styled.button`
  padding: 10px 20px;
  background-color: ${props => props.active ? 'var(--primary-color)' : '#f0f0f0'};
  color: ${props => props.active ? 'white' : 'black'};
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    opacity: 0.9;
  }
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
      <h1>Dashboard</h1>
      <DashboardGrid>
        <DashboardCard>
          <h2>Profile Overview</h2>
          <p>Welcome back, {user?.username}</p>
          <Button onClick={() => navigate('/shop')}>Start Shopping</Button>
          <Button onClick={() => setShowPostForm(!showPostForm)}>
            {showPostForm ? 'Cancel Post' : 'Post a Job'}
          </Button>
        </DashboardCard>

        <DashboardCard>
          <h2>Recent Activity</h2>
          {/* Add recent activity information */}
        </DashboardCard>

        <DashboardCard>
          <h2>Statistics</h2>
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

        {showPostForm && (
          <JobPostForm onJobPosted={handleJobPosted} />
        )}

        <JobCarousel />

        {activeTab === 'jobs' ? (
          <JobListing />
        ) : (
          <JobSearch />
        )}
      </TabContainer>
    </DashboardContainer>
  );
}

export default Dashboard;
