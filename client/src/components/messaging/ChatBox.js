import React, { useState, useEffect, useRef } from 'react';
import {
    Box,
    Paper,
    TextField,
    IconButton,
    Typography,
    Avatar,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Divider
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { useAuth } from '../../contexts/AuthContext';
import styled from 'styled-components';

const ChatContainer = styled(Paper)`
    height: 500px;
    display: flex;
    flex-direction: column;
`;

const MessagesBox = styled(Box)`
    flex-grow: 1;
    overflow-y: auto;
    padding: 16px;
`;

const MessageBubble = styled(Box)`
    background-color: ${props => props.isOwn ? props.theme.palette.primary.light : props.theme.palette.grey[100]};
    color: ${props => props.isOwn ? props.theme.palette.primary.contrastText : 'inherit'};
    padding: 8px 16px;
    border-radius: 16px;
    max-width: 70%;
    margin: 4px 0;
    align-self: ${props => props.isOwn ? 'flex-end' : 'flex-start'};
`;

const ChatBox = ({ requestId, recipientId }) => {
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        // Fetch messages for this request/conversation
        const fetchMessages = async () => {
            try {
                const response = await api.get(`/api/messages/${requestId}`);
                setMessages(response.data);
                scrollToBottom();
            } catch (error) {
                console.error('Error fetching messages:', error);
            }
        };

        fetchMessages();
        // Set up WebSocket connection here
    }, [requestId]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            const response = await api.post('/api/messages', {
                requestId,
                recipientId,
                content: newMessage
            });
            setMessages([...messages, response.data]);
            setNewMessage('');
            scrollToBottom();
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    return (
        <ChatContainer>
            <MessagesBox>
                {messages.map((message, index) => (
                    <MessageBubble
                        key={message._id}
                        isOwn={message.sender === user._id}
                    >
                        <Typography variant="body2">
                            {message.content}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                            {new Date(message.createdAt).toLocaleTimeString()}
                        </Typography>
                    </MessageBubble>
                ))}
                <div ref={messagesEndRef} />
            </MessagesBox>
            <Divider />
            <Box p={2}>
                <form onSubmit={handleSendMessage}>
                    <Box display="flex" gap={1}>
                        <TextField
                            fullWidth
                            variant="outlined"
                            placeholder="Type a message..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            size="small"
                        />
                        <IconButton 
                            color="primary" 
                            type="submit"
                            disabled={!newMessage.trim()}
                        >
                            <SendIcon />
                        </IconButton>
                    </Box>
                </form>
            </Box>
        </ChatContainer>
    );
};

export default ChatBox; 