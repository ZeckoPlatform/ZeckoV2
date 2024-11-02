import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Edit,
  Truck,
  DollarSign,
  Calendar,
  Package
} from 'react-feather';
import { format } from 'date-fns';

const Container = styled.div`
  padding: 20px;
`;

const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  gap: 15px;
  flex-wrap: wrap;
`;

const SearchBar = styled.div`
  display: flex;
  align-items: center;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 5px 10px;
  flex: 1;
  max-width: 400px;

  input {
    border: none;
    outline: none;
    padding: 5px;
    width: 100%;
  }
`;

const FilterGroup = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
`;

const Select = styled.select`
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  outline: none;

  &:focus {
    border-color: var(--primary-color);
  }
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 8px 15px;
  border: none;
  border-radius: 4px;
  background: ${props => props.variant === 'secondary' ? '#6c757d' : 'var(--primary-color)'};
  color: white;
  cursor: pointer;

  &:hover {
    opacity: 0.9;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);

  th, td {
    padding: 12px 15px;
    text-align: left;
    border-bottom: 1px solid #eee;
  }

  th {
    background: #f8f9fa;
    font-weight: 600;
  }

  tr:hover {
    background: #f8f9fa;
  }
`;

const StatusBadge = styled.span`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.85em;
  background-color: ${props => {
    switch (props.status) {
      case 'pending': return '#ffc107';
      case 'processing': return '#17a2b8';
      case 'shipped': return '#007bff';
      case 'delivered': return '#28a745';
      case 'cancelled': return '#dc3545';
      default: return '#6c757d';
    }
  }};
  color: white;
`;

const Modal = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  max-width: 800px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  z-index: 1000;
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  z-index: 999;
`;

const OrderDetails = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
`;

const DetailCard = styled.div`
  background: #f8f9fa;
  padding: 15px;
  border-radius: 4px;
`;

function OrderManagement() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/admin/orders', {
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

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        fetchOrders();
        setShowModal(false);
      } else {
        const error = await response.json();
        alert(error.message);
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status');
    }
  };

  const handleExportOrders = () => {
    const csv = [
      ['Order ID', 'Customer', 'Date', 'Status', 'Total', 'Items'],
      ...filteredOrders.map(order => [
        order.orderNumber,
        order.user.name,
        format(new Date(order.createdAt), 'PP'),
        order.status,
        order.totalAmount,
        order.items.map(item => `${item.product.name} (${item.quantity})`).join('; ')
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    const orderDate = new Date(order.createdAt);
    const today = new Date();
    const thirtyDaysAgo = new Date(today.setDate(today.getDate() - 30));
    const sevenDaysAgo = new Date(today.setDate(today.getDate() - 7));
    
    let matchesDate = true;
    if (dateFilter === 'today') {
      matchesDate = format(orderDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
    } else if (dateFilter === '7days') {
      matchesDate = orderDate >= sevenDaysAgo;
    } else if (dateFilter === '30days') {
      matchesDate = orderDate >= thirtyDaysAgo;
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  if (loading) return <div>Loading...</div>;

  return (
    <Container>
      <TopBar>
        <SearchBar>
          <Search size={20} color="#666" />
          <input
            type="text"
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchBar>

        <FilterGroup>
          <Select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </Select>

          <Select 
            value={dateFilter} 
            onChange={(e) => setDateFilter(e.target.value)}
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
          </Select>

          <Button onClick={handleExportOrders}>
            <Download size={16} />
            Export
          </Button>
        </FilterGroup>
      </TopBar>

      <Table>
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Date</th>
            <th>Status</th>
            <th>Total</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredOrders.map(order => (
            <tr key={order._id}>
              <td>{order.orderNumber}</td>
              <td>{order.user.name}</td>
              <td>{format(new Date(order.createdAt), 'PP')}</td>
              <td>
                <StatusBadge status={order.status}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </StatusBadge>
              </td>
              <td>${order.totalAmount.toFixed(2)}</td>
              <td>
                <Button 
                  variant="secondary" 
                  onClick={() => handleViewOrder(order)}
                  style={{ padding: '4px 8px' }}
                >
                  <Eye size={16} />
                  View
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {showModal && selectedOrder && (
        <>
          <Overlay onClick={() => setShowModal(false)} />
          <Modal>
            <h2>Order Details #{selectedOrder.orderNumber}</h2>
            
            <OrderDetails>
              <DetailCard>
                <h4><Calendar size={16} /> Order Date</h4>
                <p>{format(new Date(selectedOrder.createdAt), 'PPP')}</p>
              </DetailCard>

              <DetailCard>
                <h4><DollarSign size={16} /> Total Amount</h4>
                <p>${selectedOrder.totalAmount.toFixed(2)}</p>
              </DetailCard>

              <DetailCard>
                <h4><Package size={16} /> Status</h4>
                <Select
                  value={selectedOrder.status}
                  onChange={(e) => handleUpdateStatus(selectedOrder._id, e.target.value)}
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </Select>
              </DetailCard>

              <DetailCard>
                <h4><Truck size={16} /> Shipping Address</h4>
                <p>
                  {selectedOrder.shippingAddress.street}<br />
                  {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}<br />
                  {selectedOrder.shippingAddress.zipCode}<br />
                  {selectedOrder.shippingAddress.country}
                </p>
              </DetailCard>
            </OrderDetails>

            <h3>Items</h3>
            <Table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {selectedOrder.items.map(item => (
                  <tr key={item._id}>
                    <td>{item.product.name}</td>
                    <td>{item.quantity}</td>
                    <td>${item.price.toFixed(2)}</td>
                    <td>${(item.price * item.quantity).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>

            <div style={{ marginTop: '20px', textAlign: 'right' }}>
              <Button onClick={() => setShowModal(false)}>Close</Button>
            </div>
          </Modal>
        </>
      )}
    </Container>
  );
}

export default OrderManagement; 