import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    IconButton,
    Tooltip,
    CircularProgress,
    Alert
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import { formatDistance } from 'date-fns';
import { formatCurrency } from '../../utils/format';
import { useSocket } from '@/contexts/SocketContext';
import BidTimer from '../bidding/BidTimer';

const AuctionMonitor = ({ onlyWatching = false }) => {
    const [auctions, setAuctions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [watchlist, setWatchlist] = useState(new Set());
    const { socket, connected } = useSocket();

    useEffect(() => {
        fetchAuctions();
        fetchWatchlist();

        if (socket) {
            socket.on('auctionUpdate', handleAuctionUpdate);
            return () => socket.off('auctionUpdate', handleAuctionUpdate);
        }
    }, [socket]);

    const fetchAuctions = async () => {
        try {
            const response = await fetch(`/api/auctions/active${onlyWatching ? '?watching=true' : ''}`);
            if (!response.ok) throw new Error('Failed to fetch auctions');
            const data = await response.json();
            setAuctions(data.data.auctions);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchWatchlist = async () => {
        try {
            const response = await fetch('/api/auctions/watchlist');
            if (response.ok) {
                const data = await response.json();
                setWatchlist(new Set(data.data.watchlist));
            }
        } catch (err) {
            console.error('Error fetching watchlist:', err);
        }
    };

    const handleAuctionUpdate = (data) => {
        setAuctions(prev => prev.map(auction => {
            if (auction._id === data.auctionId) {
                return { ...auction, ...data.updates };
            }
            return auction;
        }));
    };

    const toggleWatch = async (auctionId) => {
        try {
            const method = watchlist.has(auctionId) ? 'DELETE' : 'POST';
            const response = await fetch(`/api/auctions/watch/${auctionId}`, { method });
            
            if (response.ok) {
                setWatchlist(prev => {
                    const newSet = new Set(prev);
                    if (method === 'DELETE') {
                        newSet.delete(auctionId);
                    } else {
                        newSet.add(auctionId);
                    }
                    return newSet;
                });
            }
        } catch (err) {
            console.error('Error toggling watch:', err);
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Alert severity="error" sx={{ mb: 2 }}>
                {error}
            </Alert>
        );
    }

    return (
        <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
                {onlyWatching ? 'Watched Auctions' : 'Active Auctions'}
            </Typography>

            {!connected && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                    Connecting to auction service...
                </Alert>
            )}

            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Product</TableCell>
                            <TableCell align="right">Current Bid</TableCell>
                            <TableCell>Time Left</TableCell>
                            <TableCell>Bids</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Watch</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {auctions.map((auction) => (
                            <TableRow key={auction._id}>
                                <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <img
                                            src={auction.product.images[0]?.url || '/placeholder.jpg'}
                                            alt={auction.product.title}
                                            style={{
                                                width: 40,
                                                height: 40,
                                                objectFit: 'cover',
                                                marginRight: 8,
                                                borderRadius: 4
                                            }}
                                        />
                                        <Typography>{auction.product.title}</Typography>
                                    </Box>
                                </TableCell>
                                <TableCell align="right">
                                    {formatCurrency(auction.currentBid || auction.startingBid)}
                                </TableCell>
                                <TableCell>
                                    <BidTimer 
                                        endTime={auction.endTime} 
                                        onTimeEnd={fetchAuctions}
                                    />
                                </TableCell>
                                <TableCell>{auction.totalBids}</TableCell>
                                <TableCell>
                                    <Chip
                                        size="small"
                                        color={auction.hasNewBids ? 'error' : 'default'}
                                        label={auction.hasNewBids ? 'New Bids' : 'Active'}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Tooltip title={watchlist.has(auction._id) ? 'Remove from watchlist' : 'Add to watchlist'}>
                                        <IconButton
                                            size="small"
                                            onClick={() => toggleWatch(auction._id)}
                                            color={watchlist.has(auction._id) ? 'primary' : 'default'}
                                        >
                                            {watchlist.has(auction._id) ? 
                                                <NotificationsActiveIcon /> : 
                                                <NotificationsIcon />
                                            }
                                        </IconButton>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    );
};

export default AuctionMonitor; 