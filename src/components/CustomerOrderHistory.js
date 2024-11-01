import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { format } from 'date-fns';
import { ChevronDown, ChevronUp } from 'react-feather';

const Container = styled.div`
  max-width: 1200px;
  margin: 20px auto;
  padding: 0 20px;
`;

const FilterBar = styled.div`
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  flex-wrap: wrap;
`;

const Select = styled.select`
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
`;

const OrderCard = styled.div`
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  margin-bottom: 15px;
  overflow: hidden;
`;

const OrderHeader = styled.div`
  padding: 15px;
  background: #f8f9fa;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
`;

const OrderDetails = styled.div`
  padding: 15px;
  border-top: 1px solid #ddd;
  display: ${props => props.isOpen ? 'block' : 'none'};
`;

const StatusBadge = styled.span`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.9em;
  background-color: ${props => {
    switch (props.status) {
      case 'delivered': return '#28a745';
      case 'shipped': return '#007bff';
      case 'processing': return '#ffc107';
      case 'cancelled': return '#dc3545';
      default: return '#6c757d';
    }
  }};
  color: white;
`;

const ItemGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
  margin-top: 15px;
`;

const ItemCard = styled.div`
  border: 1px solid #eee;
  border-radius: 4px;
  padding: 10px;
`;

function CustomerOrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date_desc');
  const [openOrders, setOpenOrders] = useState(new Set());

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setOrders(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setLoading(false);
    }
  };

  const toggleOrderDetails = (orderId) => {
    const newOpenOrders = new Set(openOrders);
    if (newOpenOrders.has(orderId)) {
      newOpenOrders.delete(orderId);
    } else {
      newOpenOrders.add(orderId);
    }
    setOpenOrders(newOpenOrders);
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return order.status === filter;
  });

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    switch (sortBy) {
      case 'date_desc':
        return new Date(b.createdAt) - new Date(a.createdAt);
      case 'date_asc':
        return new Date(a.createdAt) - new Date(b.createdAt);
      case 'amount_desc':
        return b.totalAmount - a.totalAmount;
      case 'amount_asc':
        return a.totalAmount - b.totalAmount;
      default:
        return 0;
    }
  });

  if (loading) return <div>Loading...</div>;

  return (
    <Container>
      <h2>Order History</h2>
      
      <FilterBar>
        <Select value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="all">All Orders</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </Select>

        <Select value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="date_desc">Newest First</option>
          <option value="date_asc">Oldest First</option>
          <option value="amount_desc">Highest Amount</option>
          <option value="amount_asc">Lowest Amount</option>
        </Select>
      </FilterBar>

      {sortedOrders.map(order => (
        <OrderCard key={order._id}>
          <OrderHeader onClick={() => toggleOrderDetails(order._id)}>
            <div>
              <strong>Order #{order._id.slice(-6)}</strong>
              <div>{format(new Date(order.createdAt), 'PPP')}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <StatusBadge status={order.status}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </StatusBadge>
              <strong>${order.totalAmount.toFixed(2)}</strong>
              {openOrders.has(order._id) ? <ChevronUp /> : <ChevronDown />}
            </div>
          </OrderHeader>
          
          <OrderDetails isOpen={openOrders.has(order._id)}>
            <div>
              <strong>Shipping Address:</strong>
              <p>
                {order.shippingAddress.street}<br />
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}<br />
                {order.shippingAddress.country}
              </p>
            </div>

            {order.tracking && order.tracking.trackingNumber && (
              <div>
                <strong>Tracking Information:</strong>
                <p>
                  {order.tracking.carrier} - {order.tracking.trackingNumber}
                  {order.tracking.trackingUrl && (
                    <a 
                      href={order.tracking.trackingUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ marginLeft: '10px' }}
                    >
                      Track Package
                    </a>
                  )}
                </p>
              </div>
            )}

            <strong>Items:</strong>
            <ItemGrid>
              {order.items.map(item => (
                <ItemCard key={item._id}>
                  <div>{item.product.name}</div>
                  <div>Quantity: {item.quantity}</div>
                  <div>Price: ${item.price.toFixed(2)}</div>
                </ItemCard>
              ))}
            </ItemGrid>
          </OrderDetails>
        </OrderCard>
      ))}
    </Container>
  );
}

export default CustomerOrderHistory; 