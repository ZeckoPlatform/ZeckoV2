import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { 
  TextField, 
  Button, 
  Paper, 
  CircularProgress,
  Alert,
  InputAdornment,
  Divider
} from '@mui/material';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

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

const LeadSummary = styled.div`
  margin-bottom: 2rem;
  padding: 1rem;
  background: ${({ theme }) => theme.colors.background.default};
  border-radius: ${({ theme }) => theme.borderRadius.md};
`;

const ProposalForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    amount: '',
    deliveryTime: '',
    message: ''
  });

  useEffect(() => {
    fetchLeadDetails();
  }, [id]);

  const fetchLeadDetails = async () => {
    try {
      const response = await api.get(`/leads/${id}`);
      setLead(response.data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      // Check if user has enough credits
      const creditsNeeded = 1; // Adjust based on your business logic
      if (user.credits < creditsNeeded) {
        throw new Error('Insufficient credits to submit proposal');
      }

      const response = await api.post(`/leads/${id}/proposals`, {
        ...formData,
        amount: parseFloat(formData.amount),
        deliveryTime: parseInt(formData.deliveryTime)
      });

      navigate(`/leads/${id}`, {
        state: { message: 'Proposal submitted successfully!' }
      });
    } catch (error) {
      setError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (loading) return <CircularProgress />;
  if (!lead) return <div>Lead not found</div>;

  return (
    <FormContainer>
      <h2>Submit Proposal</h2>
      
      <LeadSummary>
        <h3>{lead.title}</h3>
        <p>Budget: ${lead.budget.min} - ${lead.budget.max}</p>
      </LeadSummary>

      <Divider />

      <Form onSubmit={handleSubmit}>
        {error && (
          <Alert severity="error" style={{ marginBottom: '1rem' }}>
            {error}
          </Alert>
        )}

        <TextField
          label="Bid Amount"
          name="amount"
          type="number"
          required
          value={formData.amount}
          onChange={handleChange}
          InputProps={{
            startAdornment: <InputAdornment position="start">$</InputAdornment>,
          }}
        />

        <TextField
          label="Delivery Time (days)"
          name="deliveryTime"
          type="number"
          required
          value={formData.deliveryTime}
          onChange={handleChange}
        />

        <TextField
          label="Proposal Message"
          name="message"
          multiline
          rows={6}
          required
          value={formData.message}
          onChange={handleChange}
          placeholder="Describe why you're the best fit for this job..."
        />

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <Button 
            variant="outlined" 
            onClick={() => navigate(`/leads/${id}`)}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            color="primary"
            disabled={submitting}
          >
            {submitting ? <CircularProgress size={24} /> : 'Submit Proposal'}
          </Button>
        </div>
      </Form>
    </FormContainer>
  );
};

export default ProposalForm; 