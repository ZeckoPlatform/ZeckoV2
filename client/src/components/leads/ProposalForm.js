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

const ProposalForm = ({ lead }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    amount: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await leadService.submitProposal(id, formData);
      navigate(`/leads/${id}`);
    } catch (err) {
      setError(err.message || 'Error submitting proposal');
    } finally {
      setSubmitting(false);
    }
  };

  if (!lead) return null;

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

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Form onSubmit={handleSubmit}>
        <TextField
          name="amount"
          label="Proposal Amount (£)"
          type="number"
          required
          value={formData.amount}
          onChange={handleChange}
          InputProps={{
            startAdornment: <InputAdornment position="start">£</InputAdornment>,
          }}
        />

        <TextField
          name="message"
          label="Proposal Message"
          multiline
          rows={6}
          required
          value={formData.message}
          onChange={handleChange}
          placeholder="Describe why you're the best fit for this job..."
        />

        <Box display="flex" gap={2} justifyContent="flex-end">
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
        </Box>
      </Form>
    </FormContainer>
  );
};

export default ProposalForm; 