import React, { useState } from 'react';
import {
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Chip,
    IconButton,
    Typography,
    Box
} from '@mui/material';
import { 
    Visibility as ViewIcon,
    GetApp as DownloadIcon 
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../../utils/format';

const statusColors = {
    pending: 'warning',
    processing: 'info',
    shipped: 'primary',
    delivered: 'success',
    cancelled: 'error'
};

const OrderList = ({ orders, isVendor }) => {
    const navigate = useNavigate();
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleViewOrder = (orderId) => {
        navigate(`/orders/${orderId}`);
    };

    return (
        <Paper>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Order #</TableCell>
                            <TableCell>Date</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>{isVendor ? 'Customer' : 'Vendor'}</TableCell>
                            <TableCell>Items</TableCell>
                            <TableCell>Total</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {orders
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((order) => (
                                <TableRow key={order._id}>
                                    <TableCell>{order.orderNumber}</TableCell>
                                    <TableCell>
                                        {new Date(order.createdAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={order.status}
                                            color={statusColors[order.status]}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        {isVendor ? order.customer.name : order.vendor.name}
                                    </TableCell>
                                    <TableCell>
                                        {order.items.length} items
                                    </TableCell>
                                    <TableCell>
                                        {formatCurrency(order.total)}
                                    </TableCell>
                                    <TableCell>
                                        <IconButton 
                                            size="small"
                                            onClick={() => handleViewOrder(order._id)}
                                        >
                                            <ViewIcon />
                                        </IconButton>
                                        <IconButton size="small">
                                            <DownloadIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={orders.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />
        </Paper>
    );
};

export default OrderList; 