import React, { useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    Button,
    IconButton,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    CircularProgress,
    Alert,
    Chip,
    Stack,
    Grid,
    FormControlLabel,
    Checkbox
} from '@mui/material';
import {
    Backup as BackupIcon,
    Restore as RestoreIcon,
    Download as DownloadIcon,
    Delete as DeleteIcon,
    Info as InfoIcon
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useDropzone } from 'react-dropzone';

const BackupManager = () => {
    const [showBackupDialog, setShowBackupDialog] = useState(false);
    const [showRestoreDialog, setShowRestoreDialog] = useState(false);
    const [selectedBackup, setSelectedBackup] = useState(null);
    const [restoreOptions, setRestoreOptions] = useState({
        updateExisting: true,
        includeAuditLogs: false
    });

    const queryClient = useQueryClient();

    const { data: backups, isLoading } = useQuery({
        queryKey: ['backups'],
        queryFn: async () => {
            const response = await fetch('/api/backups');
            if (!response.ok) throw new Error('Failed to fetch backups');
            return response.json();
        }
    });

    const createBackup = useMutation({
        mutationFn: async (options) => {
            const response = await fetch('/api/backups', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(options)
            });
            if (!response.ok) throw new Error('Failed to create backup');
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['backups']);
            setShowBackupDialog(false);
        }
    });

    const restoreBackup = useMutation({
        mutationFn: async ({ backupId, options }) => {
            const response = await fetch(`/api/backups/${backupId}/restore`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(options)
            });
            if (!response.ok) throw new Error('Failed to restore backup');
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['backups']);
            setShowRestoreDialog(false);
        }
    });

    const deleteBackup = useMutation({
        mutationFn: async (backupId) => {
            const response = await fetch(`/api/backups/${backupId}`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error('Failed to delete backup');
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['backups']);
        }
    });

    const { getRootProps, getInputProps } = useDropzone({
        onDrop: (acceptedFiles) => {
            const file = acceptedFiles[0];
            // Handle backup file upload for restore
        },
        accept: {
            'application/zip': ['.zip']
        }
    });

    const downloadBackup = async (backupId) => {
        const response = await fetch(`/api/backups/${backupId}/download`);
        if (!response.ok) throw new Error('Failed to download backup');
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `backup-${backupId}.zip`;
        a.click();
    };

    return (
        <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6">Backup Management</Typography>
                <Button
                    variant="contained"
                    startIcon={<BackupIcon />}
                    onClick={() => setShowBackupDialog(true)}
                >
                    Create Backup
                </Button>
            </Box>

            {backups?.stats && (
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} md={4}>
                        <Paper sx={{ p: 2, textAlign: 'center' }}>
                            <Typography variant="h6">
                                {backups.stats.totalBackups}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Total Backups
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Paper sx={{ p: 2, textAlign: 'center' }}>
                            <Typography variant="h6">
                                {format(new Date(backups.stats.lastBackup), 'MMM d, yyyy HH:mm')}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Last Backup
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Paper sx={{ p: 2, textAlign: 'center' }}>
                            <Typography variant="h6">
                                {backups.stats.totalSize}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Total Size
                            </Typography>
                        </Paper>
                    </Grid>
                </Grid>
            )}

            <List>
                {backups?.items.map((backup) => (
                    <ListItem key={backup._id}>
                        <ListItemText
                            primary={format(new Date(backup.timestamp), 'MMM d, yyyy HH:mm:ss')}
                            secondary={
                                <Stack direction="row" spacing={1}>
                                    <Chip
                                        size="small"
                                        label={`${backup.stats.totalRecords} records`}
                                    />
                                    <Chip
                                        size="small"
                                        label={backup.size}
                                    />
                                </Stack>
                            }
                        />
                        <ListItemSecondaryAction>
                            <IconButton
                                onClick={() => downloadBackup(backup._id)}
                            >
                                <DownloadIcon />
                            </IconButton>
                            <IconButton
                                onClick={() => {
                                    setSelectedBackup(backup);
                                    setShowRestoreDialog(true);
                                }}
                            >
                                <RestoreIcon />
                            </IconButton>
                            <IconButton
                                onClick={() => deleteBackup.mutate(backup._id)}
                                color="error"
                            >
                                <DeleteIcon />
                            </IconButton>
                        </ListItemSecondaryAction>
                    </ListItem>
                ))}
            </List>

            <Dialog
                open={showBackupDialog}
                onClose={() => setShowBackupDialog(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Create Backup</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" paragraph>
                        Create a new backup of your match data. This process may take a few minutes.
                    </Typography>
                    {/* Add backup options if needed */}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowBackupDialog(false)}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={() => createBackup.mutate({})}
                        disabled={createBackup.isLoading}
                    >
                        {createBackup.isLoading ? 'Creating...' : 'Create Backup'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={showRestoreDialog}
                onClose={() => setShowRestoreDialog(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Restore Backup</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" paragraph>
                        Restore data from the selected backup. This will affect your current data.
                    </Typography>
                    
                    <Box sx={{ mb: 2 }}>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={restoreOptions.updateExisting}
                                    onChange={(e) => setRestoreOptions(prev => ({
                                        ...prev,
                                        updateExisting: e.target.checked
                                    }))}
                                />
                            }
                            label="Update existing records"
                        />
                    </Box>

                    <Box sx={{ mb: 2 }}>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={restoreOptions.includeAuditLogs}
                                    onChange={(e) => setRestoreOptions(prev => ({
                                        ...prev,
                                        includeAuditLogs: e.target.checked
                                    }))}
                                />
                            }
                            label="Include audit logs"
                        />
                    </Box>

                    {selectedBackup && (
                        <Alert severity="info" sx={{ mb: 2 }}>
                            This backup contains {selectedBackup.stats.totalRecords} records
                            and was created on {format(new Date(selectedBackup.timestamp), 'MMM d, yyyy HH:mm:ss')}
                        </Alert>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowRestoreDialog(false)}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        color="warning"
                        onClick={() => restoreBackup.mutate({
                            backupId: selectedBackup._id,
                            options: restoreOptions
                        })}
                        disabled={restoreBackup.isLoading}
                    >
                        {restoreBackup.isLoading ? 'Restoring...' : 'Restore Backup'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
};

export default BackupManager; 