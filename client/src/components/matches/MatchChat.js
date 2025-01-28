import React, { useState, useRef, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    TextField,
    IconButton,
    Avatar,
    CircularProgress,
    List,
    ListItem,
    Divider,
    Button,
    Badge,
    Tooltip,
    Menu,
    MenuItem
} from '@mui/material';
import {
    Send as SendIcon,
    AttachFile as AttachFileIcon,
    MoreVert as MoreVertIcon,
    InsertDriveFile as FileIcon
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useDropzone } from 'react-dropzone';
import { useAuth } from '../../hooks/useAuth';
import { useSocket } from '../../hooks/useSocket';
import OptimizedImage from '../common/OptimizedImage';

const MatchChat = ({ matchId }) => {
    const { user } = useAuth();
    const socket = useSocket();
    const queryClient = useQueryClient();
    const messagesEndRef = useRef(null);
    const [message, setMessage] = useState('');
    const [page, setPage] = useState(1);
    const [attachments, setAttachments] = useState([]);
    const [menuAnchor, setMenuAnchor] = useState(null);

    const { data: chatData, isLoading, fetchNextPage, hasNextPage } = useQuery({
        queryKey: ['matchMessages', matchId],
        queryFn: async ({ pageParam = 1 }) => {
            const response = await fetch(`/api/matches/${matchId}/messages?page=${pageParam}`);
            if (!response.ok) throw new Error('Failed to fetch messages');
            return response.json();
        },
        getNextPageParam: (lastPage) => lastPage.hasMore ? page + 1 : undefined,
        keepPreviousData: true
    });

    const sendMessage = useMutation({
        mutationFn: async ({ content, attachments }) => {
            const formData = new FormData();
            formData.append('content', content);
            attachments.forEach(file => formData.append('attachments', file));

            const response = await fetch(`/api/matches/${matchId}/messages`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) throw new Error('Failed to send message');
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['matchMessages', matchId]);
            setMessage('');
            setAttachments([]);
        }
    });

    const { getRootProps, getInputProps } = useDropzone({
        onDrop: (acceptedFiles) => {
            setAttachments(prev => [...prev, ...acceptedFiles]);
        },
        maxSize: 5242880 // 5MB
    });

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatData?.pages]);

    useEffect(() => {
        socket.on('new_message', (data) => {
            if (data.matchId === matchId) {
                queryClient.invalidateQueries(['matchMessages', matchId]);
            }
        });

        return () => {
            socket.off('new_message');
        };
    }, [socket, matchId, queryClient]);

    const handleSend = (e) => {
        e.preventDefault();
        if (message.trim() || attachments.length > 0) {
            sendMessage.mutate({ content: message, attachments });
        }
    };

    const renderMessage = (msg) => (
        <ListItem
            key={msg._id}
            sx={{
                flexDirection: 'column',
                alignItems: msg.sender._id === user.id ? 'flex-end' : 'flex-start',
                py: 1
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                <Avatar
                    src={msg.sender.avatar}
                    sx={{ width: 24, height: 24, mr: 1 }}
                >
                    {msg.sender.name[0]}
                </Avatar>
                <Typography variant="caption" color="textSecondary">
                    {format(new Date(msg.createdAt), 'MMM d, HH:mm')}
                </Typography>
            </Box>
            <Paper
                sx={{
                    p: 1.5,
                    maxWidth: '70%',
                    bgcolor: msg.sender._id === user.id ? 'primary.light' : 'grey.100'
                }}
            >
                <Typography variant="body2">
                    {msg.content}
                </Typography>
                {msg.attachments?.length > 0 && (
                    <Box sx={{ mt: 1 }}>
                        {msg.attachments.map((file, index) => (
                            <Button
                                key={index}
                                startIcon={<FileIcon />}
                                size="small"
                                href={file.url}
                                target="_blank"
                                sx={{ mr: 1, mb: 1 }}
                            >
                                {file.name}
                            </Button>
                        ))}
                    </Box>
                )}
            </Paper>
        </ListItem>
    );

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" p={4}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <div className="match-chat">
            <div className="chat-header">
                {chatData?.pages.map((page) =>
                    page.messages.map((msg) => (
                        <OptimizedImage
                            key={msg._id}
                            src={msg.sender.avatar || '/default-avatar.png'}
                            alt={msg.sender.name}
                            width={40}
                            height={40}
                            className="chat-avatar"
                        />
                    ))
                )}
            </div>
            <Paper sx={{ height: '600px', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6">Chat</Typography>
                        <IconButton onClick={(e) => setMenuAnchor(e.currentTarget)}>
                            <MoreVertIcon />
                        </IconButton>
                    </Box>
                </Box>

                <Menu
                    anchorEl={menuAnchor}
                    open={Boolean(menuAnchor)}
                    onClose={() => setMenuAnchor(null)}
                >
                    <MenuItem onClick={() => {/* Handle clear chat */}}>Clear Chat</MenuItem>
                    <MenuItem onClick={() => {/* Handle export chat */}}>Export Chat</MenuItem>
                </Menu>

                <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
                    {hasNextPage && (
                        <Box display="flex" justifyContent="center" mb={2}>
                            <Button onClick={() => fetchNextPage()}>
                                Load More
                            </Button>
                        </Box>
                    )}
                    
                    <List>
                        {chatData?.pages.map((page) =>
                            page.messages.map(renderMessage)
                        )}
                    </List>
                    <div ref={messagesEndRef} />
                </Box>

                <Box
                    component="form"
                    onSubmit={handleSend}
                    sx={{
                        p: 2,
                        borderTop: 1,
                        borderColor: 'divider',
                        backgroundColor: 'background.default'
                    }}
                >
                    {attachments.length > 0 && (
                        <Box sx={{ mb: 1 }}>
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
                    
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <div {...getRootProps()}>
                            <input {...getInputProps()} />
                            <IconButton>
                                <AttachFileIcon />
                            </IconButton>
                        </div>
                        <TextField
                            fullWidth
                            multiline
                            maxRows={4}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Type a message..."
                            sx={{ mr: 1 }}
                        />
                        <IconButton
                            color="primary"
                            disabled={!message.trim() && attachments.length === 0}
                            type="submit"
                        >
                            <SendIcon />
                        </IconButton>
                    </Box>
                </Box>
            </Paper>
        </div>
    );
};

export default MatchChat; 