import React, { useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    Stepper,
    Step,
    StepLabel,
    CircularProgress,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Chip,
    Divider,
    IconButton,
    Tooltip,
    Grid
} from '@mui/material';
import {
    Description as ContractIcon,
    Edit as EditIcon,
    History as HistoryIcon,
    Download as DownloadIcon,
    Check as CheckIcon,
    Close as CloseIcon,
    Timeline as TimelineIcon
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useAuth } from '../../hooks/useAuth';
import SignaturePad from 'react-signature-canvas';

const ContractForm = ({ initialData, onSubmit, isEdit }) => {
    const [formData, setFormData] = useState(initialData || {
        title: '',
        scope: '',
        deliverables: '',
        timeline: '',
        payment: '',
        terms: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        label="Contract Title"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({
                            ...prev,
                            title: e.target.value
                        }))}
                        required
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        multiline
                        rows={4}
                        label="Scope of Work"
                        value={formData.scope}
                        onChange={(e) => setFormData(prev => ({
                            ...prev,
                            scope: e.target.value
                        }))}
                        required
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        multiline
                        rows={4}
                        label="Deliverables"
                        value={formData.deliverables}
                        onChange={(e) => setFormData(prev => ({
                            ...prev,
                            deliverables: e.target.value
                        }))}
                        required
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        multiline
                        rows={4}
                        label="Timeline"
                        value={formData.timeline}
                        onChange={(e) => setFormData(prev => ({
                            ...prev,
                            timeline: e.target.value
                        }))}
                        required
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        multiline
                        rows={4}
                        label="Payment Terms"
                        value={formData.payment}
                        onChange={(e) => setFormData(prev => ({
                            ...prev,
                            payment: e.target.value
                        }))}
                        required
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        multiline
                        rows={4}
                        label="Terms and Conditions"
                        value={formData.terms}
                        onChange={(e) => setFormData(prev => ({
                            ...prev,
                            terms: e.target.value
                        }))}
                        required
                    />
                </Grid>
                <Grid item xs={12}>
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        fullWidth
                    >
                        {isEdit ? 'Update Contract' : 'Create Contract'}
                    </Button>
                </Grid>
            </Grid>
        </form>
    );
};

const SignatureDialog = ({ open, onClose, onSign }) => {
    const [signature, setSignature] = useState(null);
    const sigPad = React.useRef();

    const handleSign = () => {
        if (sigPad.current.isEmpty()) {
            return;
        }

        const signatureData = {
            dataUrl: sigPad.current.toDataURL(),
            ipAddress: window.localStorage.getItem('userIp') // Should be properly implemented
        };

        onSign(signatureData);
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Sign Contract</DialogTitle>
            <DialogContent>
                <Box sx={{ border: '1px solid #ccc', my: 2 }}>
                    <SignaturePad
                        ref={sigPad}
                        canvasProps={{
                            width: 500,
                            height: 200,
                            className: 'signature-canvas'
                        }}
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => sigPad.current.clear()}>
                    Clear
                </Button>
                <Button onClick={onClose}>
                    Cancel
                </Button>
                <Button onClick={handleSign} variant="contained">
                    Sign
                </Button>
            </DialogActions>
        </Dialog>
    );
};

const ContractManager = ({ matchId }) => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [showForm, setShowForm] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [showSignature, setShowSignature] = useState(false);

    const { data: contract, isLoading } = useQuery({
        queryKey: ['contract', matchId],
        queryFn: async () => {
            const response = await fetch(`/api/matches/${matchId}/contract`);
            if (!response.ok) throw new Error('Failed to fetch contract');
            return response.json();
        }
    });

    const createContract = useMutation({
        mutationFn: async (data) => {
            const response = await fetch(`/api/matches/${matchId}/contract`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!response.ok) throw new Error('Failed to create contract');
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['contract', matchId]);
            setShowForm(false);
        }
    });

    const updateContract = useMutation({
        mutationFn: async (data) => {
            const response = await fetch(`/api/matches/${matchId}/contract/${contract._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!response.ok) throw new Error('Failed to update contract');
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['contract', matchId]);
            setShowForm(false);
        }
    });

    const signContract = useMutation({
        mutationFn: async (signatureData) => {
            const response = await fetch(`/api/matches/${matchId}/contract/${contract._id}/sign`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ signatureData })
            });
            if (!response.ok) throw new Error('Failed to sign contract');
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['contract', matchId]);
            setShowSignature(false);
        }
    });

    const downloadContract = async () => {
        const response = await fetch(`/api/matches/${matchId}/contract/${contract._id}/pdf`);
        if (!response.ok) throw new Error('Failed to download contract');
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `contract-${contract._id}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" p={4}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Paper sx={{ p: 3 }}>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Contract Management</Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    {contract && (
                        <>
                            <Tooltip title="Download PDF">
                                <IconButton onClick={downloadContract}>
                                    <DownloadIcon />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="View History">
                                <IconButton onClick={() => setShowHistory(true)}>
                                    <HistoryIcon />
                                </IconButton>
                            </Tooltip>
                            {contract.status !== 'active' && (
                                <Tooltip title="Edit Contract">
                                    <IconButton onClick={() => setShowForm(true)}>
                                        <EditIcon />
                                    </IconButton>
                                </Tooltip>
                            )}
                        </>
                    )}
                    {!contract && (
                        <Button
                            variant="contained"
                            startIcon={<ContractIcon />}
                            onClick={() => setShowForm(true)}
                        >
                            Create Contract
                        </Button>
                    )}
                </Box>
            </Box>

            {contract && (
                <Box>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <Typography variant="subtitle1" gutterBottom>
                                Status
                            </Typography>
                            <Chip
                                label={contract.status.toUpperCase()}
                                color={contract.status === 'active' ? 'success' : 'warning'}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Typography variant="subtitle1" gutterBottom>
                                Contract Details
                            </Typography>
                            <Typography variant="body1" paragraph>
                                {contract.title}
                            </Typography>
                            <Divider sx={{ my: 2 }} />
                            <Typography variant="subtitle2" gutterBottom>
                                Scope of Work
                            </Typography>
                            <Typography variant="body2" paragraph>
                                {contract.scope}
                            </Typography>
                            {/* Render other contract sections */}
                        </Grid>
                        <Grid item xs={12}>
                            <Typography variant="subtitle1" gutterBottom>
                                Signatures
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <Chip
                                    label="Business Signature"
                                    icon={contract.businessSignature ? <CheckIcon /> : <CloseIcon />}
                                    color={contract.businessSignature ? 'success' : 'default'}
                                />
                                <Chip
                                    label="Lead Signature"
                                    icon={contract.leadSignature ? <CheckIcon /> : <CloseIcon />}
                                    color={contract.leadSignature ? 'success' : 'default'}
                                />
                            </Box>
                            {contract.status !== 'active' && (
                                <Button
                                    variant="contained"
                                    onClick={() => setShowSignature(true)}
                                    sx={{ mt: 2 }}
                                    disabled={
                                        (user.role === 'business' && contract.businessSignature) ||
                                        (user.role === 'lead' && contract.leadSignature)
                                    }
                                >
                                    Sign Contract
                                </Button>
                            )}
                        </Grid>
                    </Grid>
                </Box>
            )}

            <Dialog
                open={showForm}
                onClose={() => setShowForm(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    {contract ? 'Edit Contract' : 'Create Contract'}
                </DialogTitle>
                <DialogContent>
                    <ContractForm
                        initialData={contract}
                        onSubmit={contract ? updateContract.mutate : createContract.mutate}
                        isEdit={!!contract}
                    />
                </DialogContent>
            </Dialog>

            <Dialog
                open={showHistory}
                onClose={() => setShowHistory(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>Contract History</DialogTitle>
                <DialogContent>
                    <List>
                        {contract?.history.map((event, index) => (
                            <ListItem key={index}>
                                <ListItemIcon>
                                    <TimelineIcon />
                                </ListItemIcon>
                                <ListItemText
                                    primary={event.action.replace(/_/g, ' ')}
                                    secondary={format(new Date(event.timestamp), 'MMM d, yyyy HH:mm')}
                                />
                            </ListItem>
                        ))}
                    </List>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowHistory(false)}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            <SignatureDialog
                open={showSignature}
                onClose={() => setShowSignature(false)}
                onSign={signContract.mutate}
            />
        </Paper>
    );
};

export default ContractManager; 