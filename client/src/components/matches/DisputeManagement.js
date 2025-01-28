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
    ListItemAvatar,
    Avatar,
    Chip,
    Divider,
    IconButton,
    Tooltip
} from '@mui/material';
import {
    Send as SendIcon,
    AttachFile as AttachFileIcon,
    Warning as WarningIcon,
    CheckCircle as CheckCircleIcon,
    Timeline as TimelineIcon
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDropzone } from 'react-dropzone';
import { format } from 'date-fns';
import { useAuth } from '../../hooks/useAuth';

const DisputeManagement = ({ matchId, disputeId }) => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [response, setResponse] = useState('');
    const [attachments, setAttachments] = useState([]);
    const [showTimeline, setShowTimeline] = useState(false);

    const { data: dispute, isLoading } = useQuery({
        queryKey: ['dispute', disputeId],
        queryFn: async () => {
            const response = await fetch(`/api/disputes/${disputeId}`);
            if (!response.ok) throw new Error('Failed to fetch dispute');
            return response.json();
        }
    });

    const addResponse = useMutation({
        mutationFn: async ({ content, attachments }) => {
            const formData = new FormData();
            formData.append('content', content);
            attachments.forEach(file => formData.append('attachments', file));

            const response = await fetch(`/api/disputes/${disputeId}/responses`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) throw new Error('Failed to add response');
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['dispute', disputeId]);
            setResponse('');
            setAttachments([]);
        }
    });

    const { getRootProps, getInputProps } = useDropzone({
        onDrop: (acceptedFiles) => {
            setAttachments(prev => [...prev, ...acceptedFiles]);
        },
        maxSize: 5242880 // 5MB
    });

    const handleSubmitResponse = (e) => {
        e.preventDefault();
        if (response.trim() || attachments.length > 0) {
            addResponse.mutate({ content: response, attachments });
        }
    };

    const renderStatus = (status) => {
        const statusColors = {
            pending: 'warning',
            inProgress: 'info',
            resolved: 'success'
        };

        return (
            <Chip
                label={status.toUpperCase()}
                color={statusColors[status]}
                icon={status === 'resolved' ? <CheckCircleIcon /> : <WarningIcon />}
            />
        );
    };

    const renderTimeline = () => (
        <Dialog
            open={showTimeline}
            onClose={() => setShowTimeline(false)}
            maxWidth="md"
            fullWidth
        >
            <DialogTitle>Dispute Timeline</DialogTitle>
            <DialogContent>
                <List>
                    {dispute.timeline.map((event, index) => (
                        <ListItem key={index}>
                            <ListItemAvatar>
                                <Avatar>
                                    <TimelineIcon />
                                </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                                primary={event.action.replace(/_/g, ' ')}
                                secondary={format(new Date(event.timestamp), 'MMM d, yyyy HH:mm')}
                            />
                            {event.details && (
                                <Typography variant="body2" color="textSecondary">
                                    {JSON.stringify(event.details)}
                                </Typography>
                            )}
                        </ListItem>
                    ))}
                </List>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setShowTimeline(false)}>Close</Button>
            </DialogActions>
        </Dialog>
    );

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
                <Typography variant="h6">Dispute Management</Typography>
                <Box>
                    {renderStatus(dispute.status)}
                    <IconButton onClick={() => setShowTimeline(true)} sx={{ ml: 1 }}>
                        <TimelineIcon />
                    </IconButton>
                </Box>
            </Box>

            <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" gutterBottom>
                    Reason: {dispute.reason}
                </Typography>
                <Typography variant="body1" paragraph>
                    {dispute.description}
                </Typography>
                {dispute.evidence?.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                            Evidence
                        </Typography>
                        {dispute.evidence.map((file, index) => (
                            <Button
                                key={index}
                                startIcon={<AttachFileIcon />}
                                href={file.url}
                                target="_blank"
                                sx={{ mr: 1, mb: 1 }}
                            >
                                {file.name}
                            </Button>
                        ))}
                    </Box>
                )}
            </Box>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Responses
                </Typography>
                <List>
                    {dispute.responses.map((response, index) => (
                        <ListItem
                            key={index}
                            sx={{
                                flexDirection: 'column',
                                alignItems: 'flex-start',
                                py: 2
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <Avatar
                                    src={response.user.avatar}
                                    sx={{ width: 32, height: 32, mr: 1 }}
                                >
                                    {response.user.name[0]}
                                </Avatar>
                                <Typography variant="subtitle2">
                                    {response.user.name}
                                </Typography>
                                <Typography variant="caption" sx={{ ml: 1 }}>
                                    {format(new Date(response.timestamp), 'MMM d, HH:mm')}
                                </Typography>
                            </Box>
                            <Typography variant="body1" sx={{ ml: 5 }}>
                                {response.content}
                            </Typography>
                            {response.attachments?.length > 0 && (
                                <Box sx={{ ml: 5, mt: 1 }}>
                                    {response.attachments.map((file, fileIndex) => (
                                        <Button
                                            key={fileIndex}
                                            startIcon={<AttachFileIcon />}
                                            href={file.url}
                                            target="_blank"
                                            size="small"
                                            sx={{ mr: 1, mb: 1 }}
                                        >
                                            {file.name}
                                        </Button>
                                    ))}
                                </Box>
                            )}
                        </ListItem>
                    ))}
                </List>
            </Box>

            {dispute.status !== 'resolved' && (
                <Box component="form" onSubmit={handleSubmitResponse}>
                    <TextField
                        fullWidth
                        multiline
                        rows={4}
                        value={response}
                        onChange={(e) => setResponse(e.target.value)}
                        placeholder="Add your response..."
                        sx={{ mb: 2 }}
                    />
                    
                    {attachments.length > 0 && (
                        <Box sx={{ mb: 2 }}>
                            {attachments.map((file, index) => (
                                <Chip
                                    key={index}
                                    label={file.name}
                                    onDelete={() => {
                                        setAttachments(prev => 
                                            prev.filter((_, i) => i !== index)
                                        );
                                    }}
                                    sx={{ mr: 1, mb: 1 }}
                                />
                            ))}
                        </Box>
                    )}
                    
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <div {...getRootProps()}>
                            <input {...getInputProps()} />
                            <Button
                                variant="outlined"
                                startIcon={<AttachFileIcon />}
                            >
                                Attach Files
                            </Button>
                        </div>
                        <Button
                            variant="contained"
                            startIcon={<SendIcon />}
                            type="submit"
                            disabled={!response.trim() && attachments.length === 0}
                        >
                            Send Response
                        </Button>
                    </Box>
                </Box>
            )}

            {renderTimeline()}
        </Paper>
    );
};

export default DisputeManagement; 