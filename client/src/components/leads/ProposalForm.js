import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { 
  TextField, 
  Button, 
  Paper, 
  CircularProgress,
  Alert,
  InputAdornment,
  Typography,
  Box
} from '@mui/material';
import leadService from '../../services/leadService';
import { getLocationDisplay } from '../../utils/locationHelpers';
import { useForm } from 'react-hook-form';

const FormContainer = styled(Paper)`
  padding: 2rem;
  margin: 2rem auto;
  max-width: 800px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const LeadSummary = styled(Box)`
  margin-bottom: 2rem;
  padding: 1rem;
  background-color: ${({ theme }) => theme.palette.grey[50]};
  border-radius: 4px;
`;

const ProposalForm = ({ lead, onSubmit, onCancel, leadBudget }) => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);

  const onSubmitForm = async (data) => {
    setLoading(true);
    try {
      await onSubmit({
        amount: parseFloat(data.amount),
        description: data.description,
        estimatedTime: data.estimatedTime
      });
    } catch (error) {
      console.error('Proposal submission error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormContainer elevation={3}>
      <Typography variant="h5" gutterBottom>
        Submit Proposal
      </Typography>

      <LeadSummary>
        <Typography variant="h6">{lead.title}</Typography>
        <Typography variant="body2" color="textSecondary">
          {getLocationDisplay(lead.location)}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Budget: £{lead.budget?.min?.toLocaleString()} - £{lead.budget?.max?.toLocaleString()}
        </Typography>
      </LeadSummary>

      <form onSubmit={handleSubmit(onSubmitForm)} className="proposal-form">
        <div className="form-group mb-3">
          <label htmlFor="amount">Proposed Amount ($)</label>
          <input
            type="number"
            id="amount"
            className={`form-control ${errors.amount ? 'is-invalid' : ''}`}
            {...register('amount', {
              required: 'Amount is required',
              min: {
                value: 1,
                message: 'Amount must be greater than 0'
              },
              max: {
                value: leadBudget * 1.5,
                message: `Amount cannot exceed ${leadBudget * 1.5}`
              }
            })}
          />
          {errors.amount && (
            <div className="invalid-feedback">{errors.amount.message}</div>
          )}
        </div>

        <div className="form-group mb-3">
          <label htmlFor="estimatedTime">Estimated Time (days)</label>
          <input
            type="number"
            id="estimatedTime"
            className={`form-control ${errors.estimatedTime ? 'is-invalid' : ''}`}
            {...register('estimatedTime', {
              required: 'Estimated time is required',
              min: {
                value: 1,
                message: 'Estimated time must be at least 1 day'
              }
            })}
          />
          {errors.estimatedTime && (
            <div className="invalid-feedback">{errors.estimatedTime.message}</div>
          )}
        </div>

        <div className="form-group mb-3">
          <label htmlFor="description">Proposal Description</label>
          <textarea
            id="description"
            className={`form-control ${errors.description ? 'is-invalid' : ''}`}
            rows="4"
            {...register('description', {
              required: 'Description is required',
              minLength: {
                value: 50,
                message: 'Description must be at least 50 characters'
              }
            })}
          />
          {errors.description && (
            <div className="invalid-feedback">{errors.description.message}</div>
          )}
        </div>

        <div className="button-group">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Submit Proposal'}
          </button>
          <button
            type="button"
            className="btn btn-secondary ms-2"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </form>
    </FormContainer>
  );
};

export default ProposalForm; 