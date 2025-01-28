import React, { useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    Grid,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    CircularProgress,
    Alert,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Chip,
    Stack,
    Stepper,
    Step,
    StepLabel,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@mui/material';
import {
    Rocket as DeployIcon,
    History as RollbackIcon,
    Backup as BackupIcon,
    Check as SuccessIcon,
    Error as ErrorIcon,
    Warning as WarningIcon,
    Settings as ConfigIcon
} from '@mui/icons-material';
import { useQuery, useMutation } from '@tanstack/react-query';
import { format } from 'date-fns';

const DeploymentManager = () => {
    const [deploymentConfig, setDeploymentConfig] = useState({
        environment: 'staging',
        version: '',
        rollbackVersion: '',
        config: {}
    });
    const [showConfigDialog, setShowConfigDialog] = useState(false);
    const [activeStep, setActiveStep] = useState(0);

    const steps = [
        'Validation',
        'Backup',
        'Migration',
        'Deployment',
        'Verification'
    ];

    const deploy = useMutation({
        mutationFn: async (config) => {
            const response = await fetch('/api/deployment/deploy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config)
            });
            if (!response.ok) throw new Error('Deployment failed');
            return response.json();
        },
        onSuccess: () => {
            deploymentHistory.refetch();
        }
    });

    const deploymentHistory = useQuery({
        queryKey: ['deploymentHistory'],
        queryFn: async () => {
            const response = await fetch('/api/deployment/history');
            if (!response.ok) throw new Error('Failed to fetch deployment history');
            return response.json();
        }
    });

    const handleDeploy = async () => {
        try {
            setActiveStep(0);
            await deploy.mutateAsync(deploymentConfig);
        } catch (error) {
            console.error('Deployment failed:', error);
        }
    };

    const renderDeploymentForm = () => (
        <Paper sx={{ p: 3, mb: 3 }}>
            <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                    <FormControl fullWidth>
                        <InputLabel>Environment</InputLabel>
                        <Select
                            value={deploymentConfig.environment}
                            onChange={(e) => setDeploymentConfig(prev => ({
                                ...prev,
                                environment: e.target.value
                            }))}
                            label="Environment"
                        >
                            <MenuItem value="development">Development</MenuItem>
                            <MenuItem value="staging">Staging</MenuItem>
                            <MenuItem value="production">Production</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} md={4}>
                    <TextField
                        fullWidth
                        label="Version"
                        value={deploymentConfig.version}
                        onChange={(e) => setDeploymentConfig(prev => ({
                            ...prev,
                            version: e.target.value
                        }))}
                        placeholder="1.0.0"
                    />
                </Grid>
                <Grid item xs={12} md={4}>
                    <TextField
                        fullWidth
                        label="Rollback Version"
                        value={deploymentConfig.rollbackVersion}
                        onChange={(e) => setDeploymentConfig(prev => ({
                            ...prev,
                            rollbackVersion: e.target.value
                        }))}
                        placeholder="0.9.0"
                    />
                </Grid>
            </Grid>
            <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                <Button
                    variant="contained"
                    startIcon={<DeployIcon />}
                    onClick={handleDeploy}
                    disabled={deploy.isLoading}
                >
                    Deploy
                </Button>
                <Button
                    startIcon={<ConfigIcon />}
                    onClick={() => setShowConfigDialog(true)}
                >
                    Configuration
                </Button>
            </Box>
        </Paper>
    );

    const renderDeploymentProgress = () => (
        <Paper sx={{ p: 3, mb: 3 }}>
            <Stepper activeStep={activeStep}>
                {steps.map((label) => (
                    <Step key={label}>
                        <StepLabel>{label}</StepLabel>
                    </Step>
                ))}
            </Stepper>
        </Paper>
    );

    const renderDeploymentHistory = () => (
        <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
                Deployment History
            </Typography>
            <List>
                {deploymentHistory.data?.map((deployment) => (
                    <ListItem key={deployment._id}>
                        <ListItemIcon>
                            {deployment.status === 'completed' ? (
                                <SuccessIcon color="success" />
                            ) : deployment.status === 'failed' ? (
                                <ErrorIcon color="error" />
                            ) : (
                                <CircularProgress size={24} />
                            )}
                        </ListItemIcon>
                        <ListItemText
                            primary={`${deployment.environment} - v${deployment.version}`}
                            secondary={format(
                                new Date(deployment.timestamp),
                                'MMM d, yyyy HH:mm:ss'
                            )}
                        />
                        <Chip
                            label={deployment.status}
                            color={
                                deployment.status === 'completed'
                                    ? 'success'
                                    : deployment.status === 'failed'
                                    ? 'error'
                                    : 'default'
                            }
                            size="small"
                        />
                    </ListItem>
                ))}
            </List>
        </Paper>
    );

    return (
        <Box>
            <Typography variant="h5" gutterBottom>
                Deployment Manager
            </Typography>

            {renderDeploymentForm()}
            {deploy.isLoading && renderDeploymentProgress()}
            {renderDeploymentHistory()}

            <Dialog
                open={showConfigDialog}
                onClose={() => setShowConfigDialog(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>Deployment Configuration</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        multiline
                        rows={10}
                        value={JSON.stringify(deploymentConfig.config, null, 2)}
                        onChange={(e) => {
                            try {
                                const config = JSON.parse(e.target.value);
                                setDeploymentConfig(prev => ({
                                    ...prev,
                                    config
                                }));
                            } catch (error) {
                                // Invalid JSON
                            }
                        }}
                        sx={{ mt: 2 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowConfigDialog(false)}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={() => setShowConfigDialog(false)}
                    >
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default DeploymentManager; 