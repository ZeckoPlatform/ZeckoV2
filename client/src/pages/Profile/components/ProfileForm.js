import React from 'react';
import {
    Grid,
    TextField,
    Button,
    Box,
    Paper,
} from '@mui/material';
import styled from 'styled-components';

const StyledPaper = styled(Paper)`
    padding: ${({ theme }) => theme.spacing.lg};
    margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const ProfileForm = ({ 
    formData, 
    handleChange, 
    handleSubmit, 
    loading,
    fields = ['email', 'username', 'phone', 'location', 'bio'],
    showBusinessFields = false 
}) => {
    return (
        <form onSubmit={handleSubmit}>
            <StyledPaper>
                <Grid container spacing={3}>
                    {fields.includes('email') && (
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Email"
                                name="email"
                                value={formData.email}
                                disabled
                                helperText="Email cannot be changed"
                            />
                        </Grid>
                    )}

                    {fields.includes('username') && (
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Username"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                            />
                        </Grid>
                    )}

                    {showBusinessFields && (
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Business Name"
                                name="businessName"
                                value={formData.businessName}
                                onChange={handleChange}
                            />
                        </Grid>
                    )}

                    {fields.includes('phone') && (
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Phone"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                            />
                        </Grid>
                    )}

                    {fields.includes('location') && (
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Location"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                            />
                        </Grid>
                    )}

                    {fields.includes('bio') && (
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Bio"
                                name="bio"
                                value={formData.bio}
                                onChange={handleChange}
                                multiline
                                rows={4}
                            />
                        </Grid>
                    )}
                </Grid>
            </StyledPaper>

            <Box mt={3} display="flex" justifyContent="flex-end">
                <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    size="large"
                    disabled={loading}
                >
                    {loading ? 'Saving...' : 'Save Changes'}
                </Button>
            </Box>
        </form>
    );
};

export default ProfileForm; 