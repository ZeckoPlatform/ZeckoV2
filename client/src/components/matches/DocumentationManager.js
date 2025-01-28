import React, { useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    IconButton,
    Chip,
    Stack,
    Grid,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Menu,
    MenuItem,
    Tooltip,
    CircularProgress,
    Alert
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Archive as ArchiveIcon,
    History as HistoryIcon,
    Download as DownloadIcon,
    Search as SearchIcon
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import MDEditor from '@uiw/react-md-editor';
import { format } from 'date-fns';
import { useAuth } from '../../hooks/useAuth';

const DocumentationManager = () => {
    const { matchId } = useParams();
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [showEditor, setShowEditor] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const { data: documentation, isLoading } = useQuery({
        queryKey: ['documentation', matchId],
        queryFn: async () => {
            const response = await fetch(`/api/matches/${matchId}/documentation`);
            if (!response.ok) throw new Error('Failed to fetch documentation');
            return response.json();
        }
    });

    const createDocument = useMutation({
        mutationFn: async (data) => {
            const response = await fetch(`/api/matches/${matchId}/documentation`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!response.ok) throw new Error('Failed to create document');
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['documentation', matchId]);
            setShowEditor(false);
        }
    });

    const updateDocument = useMutation({
        mutationFn: async ({ id, data }) => {
            const response = await fetch(`/api/matches/${matchId}/documentation/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!response.ok) throw new Error('Failed to update document');
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['documentation', matchId]);
            setShowEditor(false);
        }
    });

    const archiveDocument = useMutation({
        mutationFn: async ({ id, reason }) => {
            const response = await fetch(`/api/matches/${matchId}/documentation/${id}/archive`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason })
            });
            if (!response.ok) throw new Error('Failed to archive document');
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['documentation', matchId]);
        }
    });

    const handleSearch = async () => {
        if (!searchTerm.trim()) return;
        
        const response = await fetch(
            `/api/matches/${matchId}/documentation/search?q=${encodeURIComponent(searchTerm)}`
        );
        if (!response.ok) throw new Error('Search failed');
        const results = await response.json();
        // Handle search results
    };

    const handleExport = async (format) => {
        const response = await fetch(
            `/api/matches/${matchId}/documentation/export?format=${format}`,
            { method: 'POST' }
        );
        if (!response.ok) throw new Error('Export failed');
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `documentation.${format}`;
        a.click();
    };

    return (
        <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6">Documentation</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => {
                        setSelectedDoc(null);
                        setShowEditor(true);
                    }}
                >
                    New Document
                </Button>
            </Box>

            <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                    <Box sx={{ mb: 2 }}>
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Search documentation..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                endAdornment: (
                                    <IconButton size="small" onClick={handleSearch}>
                                        <SearchIcon />
                                    </IconButton>
                                )
                            }}
                        />
                    </Box>

                    <List>
                        {documentation?.documents.map((doc) => (
                            <ListItem
                                key={doc._id}
                                button
                                onClick={() => setSelectedDoc(doc)}
                                selected={selectedDoc?._id === doc._id}
                            >
                                <ListItemText
                                    primary={doc.title}
                                    secondary={format(new Date(doc.updatedAt), 'MMM d, yyyy')}
                                />
                                <ListItemSecondaryAction>
                                    <IconButton
                                        size="small"
                                        onClick={() => {
                                            setSelectedDoc(doc);
                                            setShowEditor(true);
                                        }}
                                    >
                                        <EditIcon />
                                    </IconButton>
                                </ListItemSecondaryAction>
                            </ListItem>
                        ))}
                    </List>
                </Grid>

                <Grid item xs={12} md={8}>
                    {selectedDoc ? (
                        <Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                <Typography variant="h6">{selectedDoc.title}</Typography>
                                <Stack direction="row" spacing={1}>
                                    <IconButton onClick={() => setShowHistory(true)}>
                                        <HistoryIcon />
                                    </IconButton>
                                    <IconButton onClick={() => handleExport('pdf')}>
                                        <DownloadIcon />
                                    </IconButton>
                                    <IconButton
                                        color="error"
                                        onClick={() => {
                                            // Handle archive
                                        }}
                                    >
                                        <ArchiveIcon />
                                    </IconButton>
                                </Stack>
                            </Box>

                            <MDEditor.Markdown source={selectedDoc.content} />

                            <Box sx={{ mt: 2 }}>
                                <Stack direction="row" spacing={1}>
                                    {selectedDoc.tags.map((tag, index) => (
                                        <Chip key={index} label={tag} size="small" />
                                    ))}
                                </Stack>
                            </Box>
                        </Box>
                    ) : (
                        <Box sx={{ textAlign: 'center', color: 'text.secondary' }}>
                            <Typography>
                                Select a document to view or create a new one
                            </Typography>
                        </Box>
                    )}
                </Grid>
            </Grid>

            <DocumentEditor
                open={showEditor}
                onClose={() => setShowEditor(false)}
                document={selectedDoc}
                onSubmit={(data) => {
                    if (selectedDoc) {
                        updateDocument.mutate({ id: selectedDoc._id, data });
                    } else {
                        createDocument.mutate(data);
                    }
                }}
            />

            <DocumentHistory
                open={showHistory}
                onClose={() => setShowHistory(false)}
                document={selectedDoc}
            />
        </Paper>
    );
};

export default DocumentationManager; 