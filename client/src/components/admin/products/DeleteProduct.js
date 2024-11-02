import React from 'react';
import styled from 'styled-components';
import { AlertTriangle } from 'react-feather';

const Modal = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  max-width: 400px;
  width: 90%;
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

const WarningIcon = styled.div`
  color: #dc3545;
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
`;

const Button = styled.button`
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  
  ${props => props.variant === 'danger' ? `
    background: #dc3545;
    color: white;
    &:hover {
      background: #c82333;
    }
  ` : `
    background: #6c757d;
    color: white;
    &:hover {
      background: #5a6268;
    }
  `}
`;

const DeleteProduct = ({ product, onConfirm, onCancel }) => {
  return (
    <>
      <Overlay onClick={onCancel} />
      <Modal>
        <WarningIcon>
          <AlertTriangle size={48} />
        </WarningIcon>
        <h3>Confirm Delete</h3>
        <p>Are you sure you want to delete "{product.name}"? This action cannot be undone.</p>
        <ButtonGroup>
          <Button onClick={onCancel}>Cancel</Button>
          <Button variant="danger" onClick={onConfirm}>Delete</Button>
        </ButtonGroup>
      </Modal>
    </>
  );
};

export default DeleteProduct; 