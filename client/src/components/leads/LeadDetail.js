import React, { useState, useEffect } from 'react';
import { 
    Box, 
    Typography, 
    Paper, 
    Button, 
    Grid,
    TextField,
    Divider 
} from '@mui/material';
import { useParams } from 'react-router-dom';
import { useService } from '../../contexts/ServiceContext';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

const LeadDetail = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const { submitQuote } = useService();
    const [lead, setLead] = useState(null);
    const [quoteForm, setQuoteForm] = useState({
        amount: '',
        message: ''
    });

    useEffect(() => {
        // Fetch lead details
        const fetchLead = async () => {
            try {
                const response = await api.get(`/api/requests/${id}`);
                setLead(response.data);
            } catch (error) {
                console.error('Error fetching lead:', error);
            }
        };
        fetchLead();
    }, [id]);

    const handleQuoteSubmit = async (e) => {
        e.preventDefault();
        try {
            await submitQuote(id, quoteForm);
            // Show success message
        } catch (error) {
            // Show error message
        }
    };

    if (!lead) return <Typography>Loading...</Typography>;

    return (
        <Box p={3}>
            <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
                <Typography variant="h5" gutterBottom>
                    {lead.title}
                </Typography>
                <Typography color="textSecondary" gutterBottom>
                    Posted on {new Date(lead.createdAt).toLocaleDateString()}
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Grid container spacing={3}>
                    <Grid item xs={12} md={8}>
                        <Typography variant="h6" gutterBottom>
                            Description
                        </Typography>
                        <Typography paragraph>
                            {lead.description}
                        </Typography>
                        
                        <Typography variant="h6" gutterBottom>
                            Location
                        </Typography>
                        <Typography>
                            {lead.location.city}, {lead.location.postcode}
                        </Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        {user.role === 'vendor' && (
                            <Paper elevation={1} sx={{ p: 2 }}>
                                <Typography variant="h6" gutterBottom>
                                    Submit Quote
                                </Typography>
                                <form onSubmit={handleQuoteSubmit}>
                                    <TextField
                                        fullWidth
                                        label="Amount (£)"
                                        type="number"
                                        value={quoteForm.amount}
                                        onChange={(e) => setQuoteForm({
                                            ...quoteForm,
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
                                        value={quoteForm.message}
                                        onChange={(e) => setQuoteForm({
                                            ...quoteForm,
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
                                        Submit Quote
                                    </Button>
                                </form>
                            </Paper>
                        )}
                    </Grid>
                </Grid>
            </Paper>
        </Box>
    );
};

export default LeadDetail; 