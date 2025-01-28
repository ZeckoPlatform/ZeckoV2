import React, { useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    Tabs,
    Tab,
    TextField,
    Button,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    Chip,
    Stack,
    Grid,
    Divider,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    useTheme
} from '@mui/material';
import {
    Search as SearchIcon,
    Code as CodeIcon,
    Description as DescriptionIcon,
    Download as DownloadIcon,
    ContentCopy as CopyIcon,
    OpenInNew as OpenInNewIcon
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import ReactMarkdown from 'react-markdown';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

const ApiDocViewer = () => {
    const [activeTab, setActiveTab] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedEndpoint, setSelectedEndpoint] = useState(null);
    const theme = useTheme();

    const { data: documentation, isLoading } = useQuery({
        queryKey: ['apiDocs'],
        queryFn: async () => {
            const response = await fetch('/api/docs');
            if (!response.ok) throw new Error('Failed to fetch API documentation');
            return response.json();
        }
    });

    const handleSearch = async () => {
        if (!searchTerm.trim()) return;
        
        const response = await fetch(
            `/api/docs/search?q=${encodeURIComponent(searchTerm)}`
        );
        if (!response.ok) throw new Error('Search failed');
        const results = await response.json();
        // Handle search results
    };

    const downloadPostmanCollection = async () => {
        const response = await fetch('/api/docs/postman');
        if (!response.ok) throw new Error('Failed to download Postman collection');
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'match-api-collection.json';
        a.click();
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        // Show success message
    };

    return (
        <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6">API Documentation</Typography>
                <Button
                    startIcon={<DownloadIcon />}
                    onClick={downloadPostmanCollection}
                >
                    Download Postman Collection
                </Button>
            </Box>

            <Box sx={{ mb: 3 }}>
                <TextField
                    fullWidth
                    size="small"
                    placeholder="Search API documentation..."
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

            <Tabs
                value={activeTab}
                onChange={(_, newValue) => setActiveTab(newValue)}
                sx={{ mb: 3 }}
            >
                <Tab label="Overview" />
                <Tab label="Endpoints" />
                <Tab label="Models" />
                <Tab label="Examples" />
                <Tab label="Swagger" />
            </Tabs>

            {activeTab === 0 && documentation?.markdown && (
                <Box>
                    <ReactMarkdown>
                        {documentation.markdown['getting-started'].content}
                    </ReactMarkdown>
                </Box>
            )}

            {activeTab === 1 && documentation?.swagger && (
                <List>
                    {Object.entries(documentation.swagger.paths).map(([path, methods]) => (
                        <ListItem
                            key={path}
                            button
                            onClick={() => setSelectedEndpoint({ path, methods })}
                        >
                            <ListItemText
                                primary={path}
                                secondary={
                                    <Stack direction="row" spacing={1}>
                                        {Object.keys(methods).map(method => (
                                            <Chip
                                                key={method}
                                                label={method.toUpperCase()}
                                                size="small"
                                                color={
                                                    method === 'get' ? 'info' :
                                                    method === 'post' ? 'success' :
                                                    method === 'put' ? 'warning' :
                                                    method === 'delete' ? 'error' :
                                                    'default'
                                                }
                                            />
                                        ))}
                                    </Stack>
                                }
                            />
                        </ListItem>
                    ))}
                </List>
            )}

            {activeTab === 2 && documentation?.swagger && (
                <Grid container spacing={3}>
                    {Object.entries(documentation.swagger.components.schemas).map(([name, schema]) => (
                        <Grid item xs={12} md={6} key={name}>
                            <Paper sx={{ p: 2 }}>
                                <Typography variant="subtitle1" gutterBottom>
                                    {name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" paragraph>
                                    {schema.description}
                                </Typography>
                                <SyntaxHighlighter
                                    language="json"
                                    style={tomorrow}
                                    customStyle={{
                                        maxHeight: 300,
                                        overflow: 'auto'
                                    }}
                                >
                                    {JSON.stringify(schema, null, 2)}
                                </SyntaxHighlighter>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            )}

            {activeTab === 3 && documentation?.examples && (
                <Grid container spacing={3}>
                    {Object.entries(documentation.examples).map(([name, example]) => (
                        <Grid item xs={12} key={name}>
                            <Paper sx={{ p: 2 }}>
                                <Box sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    mb: 2
                                }}>
                                    <Typography variant="subtitle1">
                                        {name}
                                    </Typography>
                                    <IconButton
                                        size="small"
                                        onClick={() => copyToClipboard(JSON.stringify(example, null, 2))}
                                    >
                                        <CopyIcon />
                                    </IconButton>
                                </Box>
                                <SyntaxHighlighter
                                    language="json"
                                    style={tomorrow}
                                >
                                    {JSON.stringify(example, null, 2)}
                                </SyntaxHighlighter>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            )}

            {activeTab === 4 && documentation?.swagger && (
                <SwaggerUI
                    spec={documentation.swagger}
                    docExpansion="list"
                />
            )}

            <Dialog
                open={!!selectedEndpoint}
                onClose={() => setSelectedEndpoint(null)}
                maxWidth="md"
                fullWidth
            >
                {selectedEndpoint && (
                    <>
                        <DialogTitle>
                            {selectedEndpoint.path}
                        </DialogTitle>
                        <DialogContent>
                            {Object.entries(selectedEndpoint.methods).map(([method, details]) => (
                                <Box key={method} sx={{ mb: 3 }}>
                                    <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                                        <Chip
                                            label={method.toUpperCase()}
                                            color={
                                                method === 'get' ? 'info' :
                                                method === 'post' ? 'success' :
                                                method === 'put' ? 'warning' :
                                                method === 'delete' ? 'error' :
                                                'default'
                                            }
                                        />
                                        <Typography variant="subtitle1">
                                            {details.summary}
                                        </Typography>
                                    </Stack>

                                    <Typography variant="body2" paragraph>
                                        {details.description}
                                    </Typography>

                                    {details.parameters && (
                                        <Box sx={{ mb: 2 }}>
                                            <Typography variant="subtitle2" gutterBottom>
                                                Parameters
                                            </Typography>
                                            <List dense>
                                                {details.parameters.map((param, index) => (
                                                    <ListItem key={index}>
                                                        <ListItemText
                                                            primary={param.name}
                                                            secondary={`${param.in} - ${param.description}`}
                                                        />
                                                        {param.required && (
                                                            <Chip
                                                                label="Required"
                                                                size="small"
                                                                color="error"
                                                            />
                                                        )}
                                                    </ListItem>
                                                ))}
                                            </List>
                                        </Box>
                                    )}

                                    {details.requestBody && (
                                        <Box sx={{ mb: 2 }}>
                                            <Typography variant="subtitle2" gutterBottom>
                                                Request Body
                                            </Typography>
                                            <SyntaxHighlighter
                                                language="json"
                                                style={tomorrow}
                                            >
                                                {JSON.stringify(
                                                    details.requestBody.content['application/json'].schema,
                                                    null,
                                                    2
                                                )}
                                            </SyntaxHighlighter>
                                        </Box>
                                    )}

                                    {details.responses && (
                                        <Box>
                                            <Typography variant="subtitle2" gutterBottom>
                                                Responses
                                            </Typography>
                                            {Object.entries(details.responses).map(([code, response]) => (
                                                <Box key={code} sx={{ mb: 2 }}>
                                                    <Typography variant="body2" gutterBottom>
                                                        {code} - {response.description}
                                                    </Typography>
                                                    {response.content && (
                                                        <SyntaxHighlighter
                                                            language="json"
                                                            style={tomorrow}
                                                        >
                                                            {JSON.stringify(
                                                                response.content['application/json'].schema,
                                                                null,
                                                                2
                                                            )}
                                                        </SyntaxHighlighter>
                                                    )}
                                                </Box>
                                            ))}
                                        </Box>
                                    )}
                                </Box>
                            ))}
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setSelectedEndpoint(null)}>
                                Close
                            </Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>
        </Paper>
    );
};

export default ApiDocViewer; 