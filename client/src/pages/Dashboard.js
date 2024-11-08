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

const PostLeadButton = styled.button`
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  margin-bottom: 20px;
  transition: all 0.2s ease;

  &:hover {
    opacity: 0.9;
    transform: translateY(-2px);
  }
`;

const LeadForm = styled.form`
  background: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgba(var(--primary-color-rgb), 0.1);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  min-height: 100px;

  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgba(var(--primary-color-rgb), 0.1);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

const SubmitButton = styled.button`
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.2s ease;

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
  const [editingLead, setEditingLead] = useState(null);
  const [newLead, setNewLead] = useState({
    title: '',
    description: '',
    company: '',
    location: '',
    salary: '',
    type: 'fulltime'
  });

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

  const handleLeadInputChange = (e) => {
    setNewLead({
      ...newLead,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmitLead = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newLead)
      });

      if (!response.ok) {
        throw new Error('Failed to post lead');
      }

      const postedLead = await response.json();
      setShowPostForm(false);
      setNewLead({
        title: '',
        description: '',
        company: '',
        location: '',
        salary: '',
        type: 'fulltime'
      });
      // Optionally refresh your leads list here
    } catch (err) {
      console.error('Error posting lead:', err);
    }
  };

  const renderMetrics = () => {
    if (dashboardData?.businessMetrics) {
      return (
        <DashboardCard>
          <CardHeader>Business Metrics</CardHeader>
          <div>Orders: {dashboardData.businessMetrics.totalOrders}</div>
          <div>Revenue: ${dashboardData.businessMetrics.revenue}</div>
          <div>Products: {dashboardData.businessMetrics.products}</div>
        </DashboardCard>
      );
    }
    
    if (dashboardData?.vendorMetrics) {
      return (
        <DashboardCard>
          <CardHeader>Vendor Metrics</CardHeader>
          <div>Products: {dashboardData.vendorMetrics.totalProducts}</div>
          <div>Sales: ${dashboardData.vendorMetrics.totalSales}</div>
          <div>Pending Orders: {dashboardData.vendorMetrics.pendingOrders}</div>
        </DashboardCard>
      );
    }

    return null;
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <DashboardContainer>
      <DashboardHeader>Dashboard</DashboardHeader>
      <DashboardGrid>
        <DashboardCard>
          <CardHeader>Profile Overview</CardHeader>
          <WelcomeText>Welcome back, {dashboardData?.user?.name}</WelcomeText>
          <ButtonContainer>
            <Button onClick={() => navigate('/shop')}>Start Shopping</Button>
            {user?.role !== 'vendor' && (
              <PostLeadButton onClick={() => setShowPostForm(!showPostForm)}>
                {showPostForm ? 'Cancel' : 'Post a Lead'}
              </PostLeadButton>
            )}
          </ButtonContainer>
        </DashboardCard>

        {renderMetrics()}

        <DashboardCard>
          <CardHeader>Recent Activity</CardHeader>
          {/* Add recent activity information */}
        </DashboardCard>
      </DashboardGrid>

      {showPostForm && (
        <LeadForm onSubmit={handleSubmitLead}>
          <FormGroup>
            <Label htmlFor="title">Lead Title</Label>
            <Input
              type="text"
              id="title"
              name="title"
              value={newLead.title}
              onChange={handleLeadInputChange}
              required
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="description">Description</Label>
            <TextArea
              id="description"
              name="description"
              value={newLead.description}
              onChange={handleLeadInputChange}
              required
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="company">Company</Label>
            <Input
              type="text"
              id="company"
              name="company"
              value={newLead.company}
              onChange={handleLeadInputChange}
              required
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="location">Location</Label>
            <Input
              type="text"
              id="location"
              name="location"
              value={newLead.location}
              onChange={handleLeadInputChange}
              required
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="salary">Budget</Label>
            <Input
              type="number"
              id="salary"
              name="salary"
              value={newLead.salary}
              onChange={handleLeadInputChange}
              required
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="type">Lead Type</Label>
            <Select
              id="type"
              name="type"
              value={newLead.type}
              onChange={handleLeadInputChange}
              required
            >
              <option value="fulltime">Full-time</option>
              <option value="contract">Contract</option>
              <option value="temporary">Temporary</option>
            </Select>
          </FormGroup>

          <SubmitButton type="submit">Post Lead</SubmitButton>
        </LeadForm>
      )}

      <TabContainer>
        <TabButtons>
          <TabButton 
            active={activeTab === 'jobs'} 
            onClick={() => setActiveTab('jobs')}
          >
            Lead Listings
          </TabButton>
          <TabButton 
            active={activeTab === 'search'} 
            onClick={() => setActiveTab('search')}
          >
            Search Leads
          </TabButton>
        </TabButtons>

        <ContentSection>
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
