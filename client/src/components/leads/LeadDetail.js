import React, { useState, useEffect } from 'react';
import { 
    Box, 
    Typography, 
    Paper, 
    Button, 
    Grid,
    TextField,
    Divider,
    Chip,
    Avatar,
    Alert
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { BusinessCenter, LocationOn, AttachMoney, Person } from '@mui/icons-material';
import styled from 'styled-components';
import leadService from '../../services/leadService';

const StyledPaper = styled(Paper)`
  padding: 2rem;
  margin: 2rem 0;
`;

const MetaItem = styled(Box)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0.5rem 0;
  color: ${props => props.theme.colors.text.secondary};
`;

const LeadDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [lead, setLead] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [proposalForm, setProposalForm] = useState({
        amount: '',
        message: ''
    });

    useEffect(() => {
        const fetchLead = async () => {
            try {
                const data = await leadService.getLead(id);
                setLead(data);
            } catch (err) {
                setError(err.message || 'Error fetching lead details');
            } finally {
                setLoading(false);
            }
        };

        fetchLead();
    }, [id]);

    const handleProposalSubmit = async (e) => {
        e.preventDefault();
        try {
            await leadService.submitProposal(id, proposalForm);
            // Refresh lead data after submission
            const updatedLead = await leadService.getLead(id);
            setLead(updatedLead);
            setProposalForm({ amount: '', message: '' });
        } catch (err) {
            setError(err.message || 'Error submitting proposal');
        }
    };

    if (loading) return <Box p={3}>Loading...</Box>;
    if (error) return <Alert severity="error">{error}</Alert>;
    if (!lead) return <Alert severity="error">Lead not found</Alert>;

    const { 
        title, 
        description, 
        category,
        subcategory,
        budget,
        location,
        client,
        status,
        proposals = []
    } = lead;

    const canSubmitProposal = user && 
        user.id !== client?._id && 
        status === 'active' && 
        !proposals.some(p => p.contractor === user.id);

    return (
        <Box maxWidth="lg" margin="0 auto">
            <StyledPaper elevation={3}>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={8}>
                        <Typography variant="h4" gutterBottom>
                            {title}
                        </Typography>

                        <MetaItem>
                            <BusinessCenter fontSize="small" />
                            <Typography>
                                {category} {subcategory && `- ${subcategory}`}
                            </Typography>
                        </MetaItem>

                        {location?.city && (
                            <MetaItem>
                                <LocationOn fontSize="small" />
                                <Typography>
                                    {[location.city, location.state, location.country]
                                        .filter(Boolean)
                                        .join(', ')}
                                </Typography>
                            </MetaItem>
                        )}

                        <MetaItem>
                            <AttachMoney fontSize="small" />
                            <Typography>
                                Budget: £{budget?.min?.toLocaleString()} - £{budget?.max?.toLocaleString()}
                            </Typography>
                        </MetaItem>

                        <Box mt={3}>
                            <Typography variant="h6" gutterBottom>
                                Description
                            </Typography>
                            <Typography paragraph>
                                {description}
                            </Typography>
                        </Box>

                        <Box mt={3}>
                            <Typography variant="h6" gutterBottom>
                                About the Client
                            </Typography>
                            <Box display="flex" alignItems="center" gap={1}>
                                <Avatar>
                                    <Person />
                                </Avatar>
                                <Typography>
                                    {client?.businessName || client?.username || 'Anonymous'}
                                </Typography>
                            </Box>
                        </Box>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <StyledPaper>
                            <Typography variant="h6" gutterBottom>
                                Lead Status
                            </Typography>
                            <Chip 
                                label={status.toUpperCase()} 
                                color={status === 'active' ? 'success' : 'default'}
                                sx={{ mb: 2 }}
                            />
                            
                            {canSubmitProposal && (
                                <form onSubmit={handleProposalSubmit}>
                                    <Typography variant="h6" gutterBottom>
                                        Submit Proposal
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        label="Amount (£)"
                                        type="number"
                                        value={proposalForm.amount}
                                        onChange={(e) => setProposalForm({
                                            ...proposalForm,
                                            amount: e.target.value
                                        })}
                                        margin="normal"
                                        required
                                    />
                                    <TextField
                                        fullWidth
                                        label="Message"
                                        multiline
                                        rows={4}
                                        value={proposalForm.message}
                                        onChange={(e) => setProposalForm({
                                            ...proposalForm,
                                            message: e.target.value
                                        })}
                                        margin="normal"
                                        required
                                    />
                                    <Button 
                                        type="submit"
                                        variant="contained"
                                        fullWidth
                                        sx={{ mt: 2 }}
                                    >
                                        Submit Proposal
                                    </Button>
                                </form>
                            )}
                        </StyledPaper>
                    </Grid>
                </Grid>
            </StyledPaper>
        </Box>
    );
};

export default LeadDetail; 