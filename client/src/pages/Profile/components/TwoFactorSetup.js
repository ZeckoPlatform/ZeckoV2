import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Box,
    Typography,
    Step,
    Stepper,
    StepLabel,
    Alert
} from '@mui/material';
import { setup2FA, verify2FA, disable2FA } from '../../../services/api';

const TwoFactorSetup = ({ open, onClose, enabled, onSuccess }) => {
    const [activeStep, setActiveStep] = useState(0);
    const [setupData, setSetupData] = useState(null);
    const [verificationCode, setVerificationCode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const steps = enabled 
        ? ['Confirm Disable'] 
        : ['Generate Secret', 'Verify Code'];

    const handleSetup = async () => {
        try {
            setLoading(true);
            setError('');
            const data = await setup2FA();
            setSetupData(data);
            setActiveStep(1);
        } catch (err) {
            setError(err.message || 'Failed to setup 2FA');
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async () => {
        try {
            setLoading(true);
            setError('');
            await verify2FA(verificationCode);
            onSuccess(true);
        } catch (err) {
            setError(err.message || 'Invalid verification code');
        } finally {
            setLoading(false);
        }
    };

    const handleDisable = async () => {
        try {
            setLoading(true);
            setError('');
            await disable2FA();
            onSuccess(false);
        } catch (err) {
            setError(err.message || 'Failed to disable 2FA');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                {enabled ? 'Disable' : 'Setup'} Two-Factor Authentication
            </DialogTitle>
            
            <DialogContent>
                <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                    {steps.map((label) => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {enabled ? (
                    <Typography>
                        Are you sure you want to disable two-factor authentication? 
                        This will make your account less secure.
                    </Typography>
                ) : (
                    <>
                        {activeStep === 0 && (
                            <Typography>
                                Two-factor authentication adds an extra layer of security to your account. 
                                Click next to begin the setup process.
                            </Typography>
                        )}

                        {activeStep === 1 && setupData && (
                            <Box>
                                <Typography paragraph>
                                    1. Scan this QR code with your authenticator app:
                                </Typography>
                                <Box sx={{ textAlign: 'center', my: 2 }}>
                                    <img 
                                        src={setupData.qrCode} 
                                        alt="2FA QR Code"
                                        style={{ maxWidth: '200px' }} 
                                    />
                                </Box>
                                <Typography paragraph>
                                    2. Enter the verification code from your authenticator app:
                                </Typography>
                                <TextField
                                    fullWidth
                                    label="Verification Code"
                                    value={verificationCode}
                                    onChange={(e) => setVerificationCode(e.target.value)}
                                    margin="normal"
                                />
                                <Typography variant="caption" color="text.secondary">
                                    Save these backup codes in a secure place:
                                </Typography>
                                <Box sx={{ 
                                    bgcolor: 'grey.100', 
                                    p: 2, 
                                    borderRadius: 1,
                                    mt: 1
                                }}>
                                    {setupData.backupCodes.map((code, index) => (
                                        <Typography 
                                            key={index} 
                                            variant="mono" 
                                            sx={{ fontFamily: 'monospace' }}
                                        >
                                            {code}
                                        </Typography>
                                    ))}
                                </Box>
                            </Box>
                        )}
                    </>
                )}
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                {enabled ? (
                    <Button
                        onClick={handleDisable}
                        color="error"
                        disabled={loading}
                    >
                        Disable 2FA
                    </Button>
                ) : (
                    <Button
                        onClick={activeStep === 0 ? handleSetup : handleVerify}
                        variant="contained"
                        disabled={loading || (activeStep === 1 && !verificationCode)}
                    >
                        {activeStep === 0 ? 'Next' : 'Verify'}
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
};

export default TwoFactorSetup; 