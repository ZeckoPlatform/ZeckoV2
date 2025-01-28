import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion/motion';
import { AnimatePresence } from 'framer-motion/AnimatePresence';
import DashboardCard from './common/DashboardCard';
import { FiEdit2, FiTrash2, FiPlus, FiImage } from 'react-icons/fi';
import OptimizedImage from '../common/OptimizedImage';

const ProductsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const ActionBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.md};
`;

const SearchBar = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  flex: 1;
  min-width: 300px;
`;

const SearchInput = styled.input`
  padding: ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.text.disabled}40;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  flex: 1;
  background: ${({ theme }) => theme.colors.background.paper};
  color: ${({ theme }) => theme.colors.text.primary};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary.main};
  }
`;

const Button = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.md};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ variant, theme }) =>
    variant === 'outlined'
      ? 'transparent'
      : theme.colors.primary.gradient};
  color: ${({ variant, theme }) =>
    variant === 'outlined'
      ? theme.colors.primary.main
      : theme.colors.primary.text};
  cursor: pointer;
  font-weight: 500;
  border: ${({ variant, theme }) =>
    variant === 'outlined'
      ? `1px solid ${theme.colors.primary.main}`
      : 'none'};

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
`;

const ProductCard = styled(motion.div)`
  background: ${({ theme }) => theme.colors.background.paper};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  overflow: hidden;
  box-shadow: ${({ theme }) => theme.shadows.card};
`;

const ProductImage = styled.div`
  position: relative;
  padding-top: 100%;
  background: ${({ theme }) => theme.colors.background.main};
  
  img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const ProductInfo = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
`;

const ProductTitle = styled.h3`
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  color: ${({ theme }) => theme.colors.text.primary};
`;

const ProductPrice = styled.div`
  font-weight: bold;
  color: ${({ theme }) => theme.colors.primary.main};
`;

const ProductActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.sm};
  border-top: 1px solid ${({ theme }) => theme.colors.text.disabled}20;
`;

const Modal = styled(motion.div)`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1000;
`;

const DashboardProducts = ({ products }) => {
  const sortedProducts = useMemo(() => 
    products.sort((a, b) => b.date - a.date),
    [products]
  );

  return (
    <div className="dashboard-products">
      {sortedProducts.map((product, index) => (
        <div key={index} className="dashboard-product-card">
          <OptimizedImage
            src={product.image}
            alt={product.name}
            width={200}
            height={200}
            className="dashboard-product-image"
          />
          {/* ... rest of product card content ... */}
        </div>
      ))}
    </div>
  );
};

export default DashboardProducts;
