import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { apiService, endpoints } from '../../services/api';
import styled from 'styled-components';

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
  const notify = useNotification();

  const fetchData = async (key, endpoint) => {
    setLoading(prev => ({ ...prev, [key]: true }));
    const { data: responseData, error } = await apiService.get(endpoint);
    
    if (error) {
      notify.error(`Failed to load ${key}: ${error}`);
    } else {
      setData(prev => ({ ...prev, [key]: responseData }));
    }
    setLoading(prev => ({ ...prev, [key]: false }));
  };

  useEffect(() => {
    if (user?._id) {
      // Fetch all required data
      fetchData('jobs', endpoints.jobs.user(user._id));
      fetchData('products', endpoints.products.list({}));
      fetchData('orders', endpoints.orders.user);
      fetchData('business', endpoints.business);
      fetchData('addresses', endpoints.users.addresses);
      fetchData('cart', endpoints.cart);
    }
  }, [user]);

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

// Styled components
const DashboardContainer = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
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

export default Dashboard; 