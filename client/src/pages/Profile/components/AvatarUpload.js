import React, { useState } from 'react';
import { Box, Avatar, IconButton, Typography } from '@mui/material';
import { PhotoCamera } from '@mui/icons-material';
import { useAuth } from '../../../contexts/AuthContext';
import { uploadAvatar } from '../../../services/api';
import styled from 'styled-components';

const UploadButton = styled(IconButton)`
    position: absolute;
    bottom: 0;
    right: 0;
    background: ${({ theme }) => theme.colors.background.paper};
    &:hover {
        background: ${({ theme }) => theme.colors.background.default};
    }
`;

const AvatarContainer = styled(Box)`
    position: relative;
    width: fit-content;
    margin: 0 auto 2rem auto;
`;

const AvatarUpload = () => {
    const { user, updateUser } = useAuth();
    const [uploading, setUploading] = useState(false);

    const handleAvatarChange = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('avatar', file);

            const response = await uploadAvatar(formData);
            updateUser({ ...user, avatarUrl: response.avatarUrl });
        } catch (error) {
            console.error('Avatar upload error:', error);
        } finally {
            setUploading(false);
        }
    };

    return (
        <AvatarContainer>
            <Avatar
                src={user?.avatarUrl}
                alt={user?.username}
                sx={{ width: 120, height: 120 }}
            />
            <UploadButton
                color="primary"
                aria-label="upload picture"
                component="label"
                disabled={uploading}
            >
                <input
                    hidden
                    accept="image/*"
                    type="file"
                    onChange={handleAvatarChange}
                />
                <PhotoCamera />
            </UploadButton>
            {uploading && (
                <Typography variant="caption" display="block" textAlign="center">
                    Uploading...
                </Typography>
            )}
        </AvatarContainer>
    );
};

export default AvatarUpload; 