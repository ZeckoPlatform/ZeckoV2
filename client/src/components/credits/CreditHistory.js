import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  CircularProgress 
} from '@mui/material';
import { api } from '../../services/api';
import { getTransactions } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';

const HistoryContainer = styled.div`
  padding: 1.5rem;
  background: ${({ theme }) => theme.colors.background.paper};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  box-shadow: ${({ theme }) => theme.shadows.card};
`;

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const CreditHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const { transactions } = await getTransactions();
        setTransactions(transactions);
      } catch (err) {
        setError('Failed to load transaction history');
        console.error('Error fetching transactions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <HistoryContainer>
      <h3>Transaction History</h3>
      <div className="transaction-list">
        {transactions.length === 0 ? (
          <p>No transactions found</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction, index) => (
                <tr key={index}>
                  <td>{new Date(transaction.createdAt).toLocaleDateString()}</td>
                  <td>
                    <span className={`badge bg-${transaction.type === 'purchase' ? 'success' : 'danger'}`}>
                      {transaction.type}
                    </span>
                  </td>
                  <td>{transaction.amount}</td>
                  <td>{transaction.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </HistoryContainer>
  );
};

export default CreditHistory; 