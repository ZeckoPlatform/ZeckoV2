import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api, { endpoints } from '../services/api';
import { 
    Button, 
    IconButton, 
    Dialog, 
    DialogTitle, 
    DialogContent, 
    DialogActions,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import styled from 'styled-components';
import DashboardCard from '../components/Dashboard/common/DashboardCard';

const DashboardContainer = styled.div`
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
`;

const DashboardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const LeadsList = styled.div`
  display: grid;
  gap: 16px;
`;

const LeadItem = styled.div`
  padding: 16px;
  border: 1px solid ${({ theme }) => theme.colors.border.main};
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const LeadContent = styled.div`
  flex-grow: 1;
`;

const LeadTitle = styled.h3`
  margin: 0 0 8px 0;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const LeadDetails = styled.div`
  display: flex;
  gap: 16px;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 0.9em;
`;

const LeadActions = styled.div`
  display: flex;
  gap: 8px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 24px;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const Dashboard = () => {
    const { user } = useAuth();
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editingLead, setEditingLead] = useState(null);
    const [editFormData, setEditFormData] = useState({
        title: '',
        description: '',
        budget: { min: 0, max: 0 },
        status: ''
    });

    const fetchLeads = async () => {
        try {
            if (!user?._id) return;
            
            const response = await api.get(endpoints.leads.list, {
                params: {
                    userId: user._id
                }
            });
            setLeads(response.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching leads:', err);
            setError(err.message);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeads();
    }, [user]);

    const handlePostLead = () => {
        navigate('/post-lead');
    };

    const handleEditLead = (lead) => {
        setEditingLead(lead);
        setEditFormData({
            title: lead.title,
            description: lead.description,
            budget: {
                min: lead.budget?.min || 0,
                max: lead.budget?.max || 0
            },
            status: lead.status
        });
        setEditDialogOpen(true);
    };

    const handleEditClose = () => {
        setEditDialogOpen(false);
        setEditingLead(null);
        setEditFormData({
            title: '',
            description: '',
            budget: { min: 0, max: 0 },
            status: ''
        });
    };

    const handleEditSave = async () => {
        try {
            await api.put(`${endpoints.leads.update}/${editingLead._id}`, editFormData);
            fetchLeads(); // Refresh the leads list
            handleEditClose();
        } catch (error) {
            console.error('Error updating lead:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith('budget.')) {
            const budgetField = name.split('.')[1];
            setEditFormData(prev => ({
                ...prev,
                budget: {
                    ...prev.budget,
                    [budgetField]: Number(value)
                }
            }));
        } else {
            setEditFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleDeleteLead = async (leadId) => {
        if (window.confirm('Are you sure you want to delete this lead?')) {
            try {
                await api.delete(`${endpoints.leads.delete}/${leadId}`);
                fetchLeads();
            } catch (error) {
                console.error('Error deleting lead:', error);
            }
        }
    };

    return (
        <DashboardContainer>
            <DashboardHeader>
                <h1>My Leads</h1>
                <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={handlePostLead}
                >
                    Post Lead
                </Button>
            </DashboardHeader>

            <DashboardCard>
                {loading ? (
                    <p>Loading leads...</p>
                ) : error ? (
                    <p>Error: {error}</p>
                ) : leads.length > 0 ? (
                    <LeadsList>
                        {leads.map((lead) => (
                            <LeadItem key={lead._id}>
                                <LeadContent>
                                    <LeadTitle>{lead.title}</LeadTitle>
                                    <LeadDetails>
                                        <span>Category: {lead.category?.name || 'Uncategorized'}</span>
                                        <span>Budget: £{lead.budget?.min || 0} - £{lead.budget?.max || 0}</span>
                                        <span>Posted: {new Date(lead.createdAt).toLocaleDateString()}</span>
                                        <span>Status: {lead.status}</span>
                                    </LeadDetails>
                                </LeadContent>
                                <LeadActions>
                                    <IconButton 
                                        onClick={() => handleEditLead(lead)}
                                        color="primary"
                                        size="small"
                                    >
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton 
                                        onClick={() => handleDeleteLead(lead._id)}
                                        color="error"
                                        size="small"
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </LeadActions>
                            </LeadItem>
                        ))}
                    </LeadsList>
                ) : (
                    <EmptyState>
                        No leads posted yet. Click "Post Lead" to create your first lead.
                    </EmptyState>
                )}
            </DashboardCard>

            {/* Edit Dialog */}
            <Dialog open={editDialogOpen} onClose={handleEditClose} maxWidth="sm" fullWidth>
                <DialogTitle>Edit Lead</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        name="title"
                        label="Title"
                        type="text"
                        fullWidth
                        value={editFormData.title}
                        onChange={handleInputChange}
                    />
                    <TextField
                        margin="dense"
                        name="description"
                        label="Description"
                        type="text"
                        fullWidth
                        multiline
                        rows={4}
                        value={editFormData.description}
                        onChange={handleInputChange}
                    />
                    <TextField
                        margin="dense"
                        name="budget.min"
                        label="Minimum Budget"
                        type="number"
                        value={editFormData.budget.min}
                        onChange={handleInputChange}
                        style={{ marginRight: '1rem' }}
                    />
                    <TextField
                        margin="dense"
                        name="budget.max"
                        label="Maximum Budget"
                        type="number"
                        value={editFormData.budget.max}
                        onChange={handleInputChange}
                    />
                    <TextField
                        select
                        margin="dense"
                        name="status"
                        label="Status"
                        fullWidth
                        value={editFormData.status}
                        onChange={handleInputChange}
                    >
                        <MenuItem value="open">Open</MenuItem>
                        <MenuItem value="in_progress">In Progress</MenuItem>
                        <MenuItem value="completed">Completed</MenuItem>
                        <MenuItem value="cancelled">Cancelled</MenuItem>
                    </TextField>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleEditClose}>Cancel</Button>
                    <Button onClick={handleEditSave} color="primary">Save</Button>
                </DialogActions>
            </Dialog>
        </DashboardContainer>
    );
};

export default Dashboard;