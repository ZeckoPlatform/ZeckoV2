import React from 'react';
import styled from 'styled-components';
import { Package, Truck, CheckCircle } from 'react-feather';

const TrackingContainer = styled.div`
  max-width: 800px;
  margin: 20px auto;
  padding: 20px;
`;

const TrackingHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const TrackingInfo = styled.div`
  background: #f5f5f5;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
`;

const Timeline = styled.div`
  position: relative;
  padding-left: 30px;
  
  &::before {
    content: '';
    position: absolute;
    left: 15px;
    top: 0;
    bottom: 0;
    width: 2px;
    background: #ddd;
  }
`;

const Event = styled.div`
  position: relative;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;

  &:last-child {
    border-bottom: none;
  }

  &::before {
    content: '';
    position: absolute;
    left: -24px;
    top: 0;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: ${props => props.current ? 'var(--primary-color)' : '#ddd'};
  }
`;

const EventHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
`;

const EventStatus = styled.span`
  font-weight: bold;
  color: ${props => props.current ? 'var(--primary-color)' : 'inherit'};
`;

const EventTime = styled.span`
  color: #666;
  font-size: 0.9em;
`;

const EventLocation = styled.div`
  color: #666;
  font-size: 0.9em;
`;

function OrderTracking({ order }) {
  return (
    <TrackingContainer>
      <TrackingHeader>
        <h2>Order #{order.orderNumber}</h2>
        <div>
          {order.tracking.carrier && (
            <span>
              {order.tracking.carrier} - {order.tracking.trackingNumber}
            </span>
          )}
        </div>
      </TrackingHeader>

      <TrackingInfo>
        <div>
          <strong>Estimated Delivery:</strong>{' '}
          {order.tracking.estimatedDelivery 
            ? new Date(order.tracking.estimatedDelivery).toLocaleDateString() 
            : 'Not available'}
        </div>
        <div>
          <strong>Current Status:</strong>{' '}
          {order.tracking.currentStatus}
        </div>
      </TrackingInfo>

      <Timeline>
        {order.tracking.events.map((event, index) => (
          <Event 
            key={event._id} 
            current={index === 0}
          >
            <EventHeader>
              <EventStatus current={index === 0}>
                {event.status.replace(/_/g, ' ').toUpperCase()}
              </EventStatus>
              <EventTime>
                {new Date(event.timestamp).toLocaleString()}
              </EventTime>
            </EventHeader>
            <EventLocation>{event.location}</EventLocation>
            <div>{event.description}</div>
          </Event>
        ))}
      </Timeline>
    </TrackingContainer>
  );
}

export default OrderTracking; 