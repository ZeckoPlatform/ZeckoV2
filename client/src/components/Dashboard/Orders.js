import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardCard from './common/DashboardCard';

const OrdersContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const FilterBar = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  flex-wrap: wrap;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const SearchInput = styled.input`
  padding: ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.text.disabled}40;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ theme }) => theme.colors.background.paper};
  color: ${({ theme }) => theme.colors.text.primary};
  flex: 1;
  min-width: 200px;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary.main};
  }
`;

const FilterSelect = styled.select`
  padding: ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.text.disabled}40;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ theme }) => theme.colors.background.paper};
  color: ${({ theme }) => theme.colors.text.primary};
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary.main};
  }
`;

const OrdersTable = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  text-align: left;
  padding: ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.text.secondary};
  border-bottom: 1px solid ${({ theme }) => theme.colors.text.disabled}20;
`;

const Td = styled.td`
  padding: ${({ theme }) => theme.spacing.md};
  border-bottom: 1px solid ${({ theme }) => theme.colors.text.disabled}20;
`;

const OrderRow = styled(motion.tr)`
  cursor: pointer;
  
  &:hover {
    background: ${({ theme }) => theme.colors.background.main};
  }
`;

const StatusBadge = styled.span`
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.sm}`};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: 0.85rem;
  font-weight: 500;
  
  ${({ status, theme }) => {
    switch (status) {
      case 'completed':
        return `
          background: ${theme.colors.status.success}20;
          color: ${theme.colors.status.success};
        `;
      case 'pending':
        return `
          background: ${theme.colors.status.warning}20;
          color: ${theme.colors.status.warning};
        `;
      case 'cancelled':
        return `
          background: ${theme.colors.status.error}20;
          color: ${theme.colors.status.error};
        `;
      default:
        return `
          background: ${theme.colors.text.disabled}20;
          color: ${theme.colors.text.disabled};
        `;
    }
  }}
`;

const OrderDetails = styled(motion.div)`
  padding: ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.background.paper};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  margin-top: ${({ theme }) => theme.spacing.md};
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-top: ${({ theme }) => theme.spacing.xl};
`;

const PageButton = styled.button`
  padding: ${({ theme }) => theme.spacing.sm};
  border: 1px solid ${({ theme }) => theme.colors.primary.main};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  background: ${({ active, theme }) => 
    active ? theme.colors.primary.main : 'transparent'};
  color: ${({ active, theme }) => 
    active ? theme.colors.primary.text : theme.colors.primary.main};
  cursor: pointer;
  min-width: 32px;

  &:hover {
    background: ${({ theme }) => theme.colors.primary.main}20;
  }
`;

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;

  useEffect(() => {
    fetchOrders();
  }, [currentPage, filter]);

  const fetchOrders = async () => {
    try {
      // Replace with your actual API call
      const response = await fetch(`/api/orders?page=${currentPage}&filter=${filter}`);
      const data = await response.json();
      setOrders(data.orders);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setLoading(false);
    }
  };

  const handleOrderClick = (order) => {
    setSelectedOrder(selectedOrder?.id === order.id ? null : order);
  };

  const filteredOrders = orders.filter(order => 
    order.id.toLowerCase().includes(search.toLowerCase()) ||
    order.customer.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  return (
    <OrdersContainer>
      <FilterBar>
        <SearchInput
          type="text"
          placeholder="Search orders..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <FilterSelect
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All Orders</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="cancelled">Cancelled</option>
        </FilterSelect>
      </FilterBar>

      <DashboardCard>
        <OrdersTable>
          <thead>
            <tr>
              <Th>Order ID</Th>
              <Th>Customer</Th>
              <Th>Date</Th>
              <Th>Total</Th>
              <Th>Status</Th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <React.Fragment key={order.id}>
                <OrderRow
                  onClick={() => handleOrderClick(order)}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Td>{order.id}</Td>
                  <Td>{order.customer}</Td>
                  <Td>{new Date(order.date).toLocaleDateString()}</Td>
                  <Td>${order.total.toFixed(2)}</Td>
                  <Td>
                    <StatusBadge status={order.status}>
                      {order.status}
                    </StatusBadge>
                  </Td>
                </OrderRow>
                <AnimatePresence>
                  {selectedOrder?.id === order.id && (
                    <tr>
                      <td colSpan="5">
                        <OrderDetails
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                        >
                          {/* Order details content */}
                          <h4>Order Details</h4>
                          <p>Customer: {order.customer}</p>
                          <p>Email: {order.email}</p>
                          <p>Phone: {order.phone}</p>
                          {/* Add more order details as needed */}
                        </OrderDetails>
                      </td>
                    </tr>
                  )}
                </AnimatePresence>
              </React.Fragment>
            ))}
          </tbody>
        </OrdersTable>
      </DashboardCard>

      <Pagination>
        {[...Array(totalPages)].map((_, index) => (
          <PageButton
            key={index + 1}
            active={currentPage === index + 1}
            onClick={() => setCurrentPage(index + 1)}
          >
            {index + 1}
          </PageButton>
        ))}
      </Pagination>
    </OrdersContainer>
  );
};

export default Orders; 