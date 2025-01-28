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
    Button,
    Chip,
    IconButton,
    Menu,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { formatDistance } from 'date-fns';
import { formatCurrency } from '@/utils/format';

const BidManagement = ({ productId }) => {
    const [bids, setBids] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedBid, setSelectedBid] = useState(null);
    const [confirmDialog, setConfirmDialog] = useState(false);

    useEffect(() => {
        fetchBids();
    }, [productId]);

    const fetchBids = async () => {
        try {
            const response = await fetch(`/api/bids/product/${productId}/manage`);
            if (!response.ok) throw new Error('Failed to fetch bids');
            const data = await response.json();
            setBids(data.data.bids);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleMenuOpen = (event, bid) => {
        setAnchorEl(event.currentTarget);
        setSelectedBid(bid);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedBid(null);
    };

    const handleAcceptBid = async () => {
        try {
            const response = await fetch(`/api/bids/${selectedBid._id}/accept`, {
                method: 'POST'
            });
            if (!response.ok) throw new Error('Failed to accept bid');
            await fetchBids();
            handleMenuClose();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleRejectBid = async () => {
        try {
            const response = await fetch(`/api/bids/${selectedBid._id}/reject`, {
                method: 'POST'
            });
            if (!response.ok) throw new Error('Failed to reject bid');
            await fetchBids();
            handleMenuClose();
        } catch (err) {
            setError(err.message);
        }
    };

    const getStatusChip = (status) => {
        const statusConfig = {
            active: { color: 'primary', label: 'Active' },
            accepted: { color: 'success', label: 'Accepted' },
            rejected: { color: 'error', label: 'Rejected' },
            outbid: { color: 'warning', label: 'Outbid' }
        };

        const config = statusConfig[status] || { color: 'default', label: status };
        return <Chip size="small" color={config.color} label={config.label} />;
    };

    return (
        <Box>
            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Bidder</TableCell>
                            <TableCell align="right">Amount</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Time</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {bids.map((bid) => (
                            <TableRow key={bid._id}>
                                <TableCell>{bid.bidder.name}</TableCell>
                                <TableCell align="right">
                                    {formatCurrency(bid.amount)}
                                </TableCell>
                                <TableCell>{getStatusChip(bid.status)}</TableCell>
                                <TableCell>
                                    {formatDistance(new Date(bid.createdAt), new Date(), {
                                        addSuffix: true
                                    })}
                                </TableCell>
                                <TableCell>
                                    <IconButton
                                        size="small"
                                        onClick={(e) => handleMenuOpen(e, bid)}
                                        disabled={bid.status !== 'active'}
                                    >
                                        <MoreVertIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
            >
                <MenuItem onClick={() => setConfirmDialog('accept')}>
                    Accept Bid
                </MenuItem>
                <MenuItem onClick={() => setConfirmDialog('reject')}>
                    Reject Bid
                </MenuItem>
            </Menu>

            <Dialog
                open={Boolean(confirmDialog)}
                onClose={() => setConfirmDialog(false)}
            >
                <DialogTitle>
                    {confirmDialog === 'accept'
                        ? 'Accept Bid'
                        : 'Reject Bid'}
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to {confirmDialog} this bid for{' '}
                        {selectedBid && formatCurrency(selectedBid.amount)}?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmDialog(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={confirmDialog === 'accept' ? handleAcceptBid : handleRejectBid}
                        color={confirmDialog === 'accept' ? 'primary' : 'error'}
                        variant="contained"
                    >
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default BidManagement; 