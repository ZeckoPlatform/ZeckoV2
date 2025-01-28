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
import { jobCategories } from '../../data/leadCategories';
import LoadingSpinner from '../common/LoadingSpinner';
import ProposalForm from './ProposalForm';

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
    const [showProposalForm, setShowProposalForm] = useState(false);

    useEffect(() => {
        const fetchLead = async () => {
            try {
                const data = await leadService.getLead(id);
                setLead(data);
            } catch (err) {
                setError('Error loading lead details');
                console.error('Lead detail error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchLead();
    }, [id]);

    const handleProposalSubmit = async (proposalData) => {
        try {
            await leadService.submitProposal(id, proposalData);
            // Refresh lead data to show new proposal
            const updatedLead = await leadService.getLead(id);
            setLead(updatedLead);
            setShowProposalForm(false);
        } catch (err) {
            setError('Error submitting proposal');
            console.error('Proposal submission error:', err);
        }
    };

    if (loading) return <LoadingSpinner />;
    if (error) return <div className="alert alert-danger">{error}</div>;
    if (!lead) return <div>Lead not found</div>;

    const { 
        title, 
        description, 
        category,
        subcategory,
        budget,
        location,
        client,
        status,
        proposals = [],
        leadPrice
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
                                <div className="proposal-section">
                                    {!lead.hasSubmittedProposal ? (
                                        <>
                                            <button 
                                                onClick={() => setShowProposalForm(true)}
                                                className="btn btn-primary"
                                            >
                                                Submit Proposal
                                            </button>
                                            {showProposalForm && (
                                                <ProposalForm 
                                                    onSubmit={handleProposalSubmit}
                                                    onCancel={() => setShowProposalForm(false)}
                                                />
                                            )}
                                        </>
                                    ) : (
                                        <div className="alert alert-info">
                                            You have already submitted a proposal for this lead
                                        </div>
                                    )}
                                </div>
                            )}
                        </StyledPaper>
                    </Grid>
                </Grid>
            </StyledPaper>
        </Box>
    );
};

export default LeadDetail; 