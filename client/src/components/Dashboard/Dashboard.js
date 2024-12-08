import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { fetchData, endpoints } from '../../services/api';
import styled from 'styled-components';

const DashboardContainer = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  background: ${({ theme }) => theme?.colors?.background?.paper || '#F5F5F5'};
  color: ${({ theme }) => theme?.colors?.text?.primary || '#333333'};
  min-height: calc(100vh - 64px);
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
  font-size: 1.2em;
`;

const Section = styled.section`
  margin-bottom: 30px;
  background: ${({ theme }) => theme?.colors?.background?.paper || '#F5F5F5'};
  padding: 20px;
  border-radius: ${({ theme }) => theme?.borderRadius?.md || '8px'};
  box-shadow: ${({ theme }) => theme?.shadows?.card || '0 2px 4px rgba(0,0,0,0.1)'};
`;

const JobsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const JobItem = styled.div`
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
`;

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
`;

const ProductCard = styled.div`
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
`;

const Dashboard = () => {
  const [data, setData] = useState({
    jobs: [],
    products: [],
    orders: [],
    business: null,
    addresses: [],
    cart: null
  });
  const [loading, setLoading] = useState({
    jobs: true,
    products: true,
    orders: true,
    business: true,
    addresses: true,
    cart: true
  });
  const { user } = useAuth();
  const { error: notify } = useNotification();

  const loadData = useCallback(async (key, endpoint) => {
    setLoading(prev => ({ ...prev, [key]: true }));
    try {
      const { data: responseData, error } = await fetchData(endpoint);
      if (error) {
        notify(`Failed to load ${key}: ${error}`);
      } else {
        setData(prev => ({ ...prev, [key]: responseData }));
      }
    } catch (err) {
      notify(`Error loading ${key}`);
    } finally {
      setLoading(prev => ({ ...prev, [key]: false }));
    }
  }, [notify]);

  useEffect(() => {
    console.log('Dashboard mounted, user:', user);
    if (user?._id) {
      loadData('jobs', endpoints.jobs.user(user._id));
      loadData('products', endpoints.products.list({}));
      loadData('orders', endpoints.orders.user);
      loadData('business', endpoints.business);
      loadData('addresses', endpoints.users.addresses);
      loadData('cart', endpoints.cart);
    }
  }, [user, loadData]);

  if (!user) {
    return <LoadingContainer>Please log in to view your dashboard</LoadingContainer>;
  }

  if (Object.values(loading).every(Boolean)) {
    return <LoadingContainer>Loading dashboard...</LoadingContainer>;
  }

  return (
    <DashboardContainer>
      {/* Jobs Section */}
      <Section>
        <h2>Your Jobs</h2>
        {loading.jobs ? (
          <p>Loading jobs...</p>
        ) : data.jobs?.length > 0 ? (
          <JobsList>
            {data.jobs.map(job => (
              <JobItem key={job._id}>
                <h3>{job.title}</h3>
                <p>{job.description}</p>
              </JobItem>
            ))}
          </JobsList>
        ) : (
          <p>No jobs found</p>
        )}
      </Section>

      {/* Products Section */}
      <Section>
        <h2>Products</h2>
        {loading.products ? (
          <p>Loading products...</p>
        ) : data.products?.length > 0 ? (
          <ProductGrid>
            {data.products.map(product => (
              <ProductCard key={product._id}>
                <h3>{product.name}</h3>
                <p>{product.price}</p>
              </ProductCard>
            ))}
          </ProductGrid>
        ) : (
          <p>No products found</p>
        )}
      </Section>

      {/* Add more sections as needed */}
    </DashboardContainer>
  );
};

export default Dashboard; 