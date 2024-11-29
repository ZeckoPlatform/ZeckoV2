import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const Modal = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled(motion.div)`
  background: white;
  padding: 2rem;
  border-radius: 8px;
  max-width: 400px;
  width: 90%;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  
  &.cancel {
    background: #e0e0e0;
  }
  
  &.delete {
    background: #f44336;
    color: white;
  }
`;

const DeleteProduct = ({ product, onConfirm, onCancel }) => {
  return (
    <Modal
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <ModalContent
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
      >
        <h2>Delete Product</h2>
        <p>Are you sure you want to delete {product?.name}? This action cannot be undone.</p>
        <ButtonGroup>
          <Button className="cancel" onClick={onCancel}>Cancel</Button>
          <Button className="delete" onClick={onConfirm}>Delete</Button>
        </ButtonGroup>
      </ModalContent>
    </Modal>
  );
};

export default DeleteProduct; 