import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { format } from 'date-fns';
import { ChevronDown, ChevronUp, Edit, Download } from 'react-feather';
import OrderExport from './OrderExport';

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

const SearchInput = styled.input`
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  min-width: 200px;
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

const Button = styled.button`
  padding: 8px 15px;
  border: none;
  border-radius: 4px;
  background: ${props => props.secondary ? '#6c757d' : 'var(--primary-color)'};
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;

  &:hover {
    opacity: 0.9;
  }
`;

const TrackingForm = styled.form`
  margin-top: 15px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 4px;
`;

const Input = styled.input`
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-right: 10px;
  width: ${props => props.width || '200px'};
`;

function SellerOrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date_desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [openOrders, setOpenOrders] = useState(new Set());
  const [editingTracking, setEditingTracking] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/vendor/orders', {
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

  const updateOrderStatus = async (orderId, status) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status })
      });
      
      if (response.ok) {
        fetchOrders(); // Refresh orders
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const updateTracking = async (orderId, trackingData) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/tracking`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(trackingData)
      });
      
      if (response.ok) {
        setEditingTracking(null);
        fetchOrders(); // Refresh orders
      }
    } catch (error) {
      console.error('Error updating tracking:', error);
    }
  };

  const handleTrackingSubmit = (e, orderId) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    updateTracking(orderId, {
      carrier: formData.get('carrier'),
      trackingNumber: formData.get('trackingNumber'),
      trackingUrl: formData.get('trackingUrl')
    });
  };

  const filteredOrders = orders.filter(order => {
    if (filter !== 'all' && order.status !== filter) return false;
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        order._id.toLowerCase().includes(searchLower) ||
        order.user.name.toLowerCase().includes(searchLower) ||
        order.items.some(item => 
          item.product.name.toLowerCase().includes(searchLower)
        )
      );
    }
    
    return true;
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Seller Orders</h2>
        <OrderExport orders={filteredOrders} />
      </div>

      <FilterBar>
        <SearchInput
          type="text"
          placeholder="Search orders..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />

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
          <OrderHeader onClick={() => {
            const newOpenOrders = new Set(openOrders);
            if (newOpenOrders.has(order._id)) {
              newOpenOrders.delete(order._id);
            } else {
              newOpenOrders.add(order._id);
            }
            setOpenOrders(newOpenOrders);
          }}>
            <div>
              <strong>Order #{order._id.slice(-6)}</strong>
              <div>{format(new Date(order.createdAt), 'PPP')}</div>
              <div>Customer: {order.user.name}</div>
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
            <div style={{ marginBottom: '15px' }}>
              <strong>Update Status:</strong>
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                {['processing', 'shipped', 'delivered', 'cancelled'].map(status => (
                  <Button
                    key={status}
                    secondary={true}
                    onClick={() => updateOrderStatus(order._id, status)}
                    disabled={order.status === status}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong>Tracking Information:</strong>
                <Button onClick={() => setEditingTracking(order._id)}>
                  <Edit size={16} />
                  Update Tracking
                </Button>
              </div>

              {editingTracking === order._id ? (
                <TrackingForm onSubmit={e => handleTrackingSubmit(e, order._id)}>
                  <div style={{ display: 'grid', gap: '10px', gridTemplateColumns: '1fr 1fr 1fr auto' }}>
                    <Select name="carrier" defaultValue={order.tracking?.carrier || ''}>
                      <option value="">Select Carrier</option>
                      <option value="Royal Mail">Royal Mail</option>
                      <option value="DHL">DHL</option>
                      <option value="FedEx">FedEx</option>
                      <option value="UPS">UPS</option>
                      <option value="USPS">USPS</option>
                      <option value="DPD">DPD</option>
                      <option value="Hermes">Hermes</option>
                      <option value="Other">Other</option>
                    </Select>
                    <Input
                      name="trackingNumber"
                      placeholder="Tracking Number"
                      defaultValue={order.tracking?.trackingNumber || ''}
                    />
                    <Input
                      name="trackingUrl"
                      placeholder="Tracking URL"
                      defaultValue={order.tracking?.trackingUrl || ''}
                    />
                    <Button type="submit">Save</Button>
                  </div>
                </TrackingForm>
              ) : (
                order.tracking && order.tracking.trackingNumber ? (
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
                ) : (
                  <p>No tracking information available</p>
                )
              )}
            </div>

            <div>
              <strong>Items:</strong>
              <div style={{ display: 'grid', gap: '10px', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', marginTop: '10px' }}>
                {order.items.map(item => (
                  <div 
                    key={item._id}
                    style={{ 
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      padding: '10px'
                    }}
                  >
                    <div>{item.product.name}</div>
                    <div>Quantity: {item.quantity}</div>
                    <div>Price: ${item.price.toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </div>
          </OrderDetails>
        </OrderCard>
      ))}
    </Container>
  );
}

export default SellerOrderHistory; 