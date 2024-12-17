import React from 'react';
import {
    Grid,
    Paper,
    Typography,
    Box,
    Button,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Chip,
    LinearProgress,
    Card,
    CardContent
} from '@mui/material';
import {
    Store as StoreIcon,
    ShoppingCart as CartIcon,
    TrendingUp as TrendingIcon,
    Inventory as InventoryIcon,
    MonetizationOn as MoneyIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const StyledPaper = styled(Paper)`
    padding: 24px;
    height: 100%;
`;

const StatCard = styled(Card)`
    background: ${props => props.theme.palette.primary.main};
    color: white;
`;

const VendorDashboard = () => {
    const navigate = useNavigate();

    return (
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h4">Vendor Dashboard</Typography>
                    <Button
                        variant="contained"
                        startIcon={<InventoryIcon />}
                        onClick={() => navigate('/vendor/products/new')}
                    >
                        Add New Product
                    </Button>
                </Box>
            </Grid>

            {/* Stats Overview */}
            <Grid item xs={12} sm={6} md={3}>
                <StatCard>
                    <CardContent>
                        <Typography color="inherit" variant="subtitle2">
                            Total Sales
                        </Typography>
                        <Typography color="inherit" variant="h4">
                            £4,589
                        </Typography>
                        <Typography color="inherit" variant="body2">
                            +12% from last month
                        </Typography>
                    </CardContent>
                </StatCard>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
                <StatCard>
                    <CardContent>
                        <Typography color="inherit" variant="subtitle2">
                            Orders
                        </Typography>
                        <Typography color="inherit" variant="h4">
                            45
                        </Typography>
                        <Typography color="inherit" variant="body2">
                            8 pending fulfillment
                        </Typography>
                    </CardContent>
                </StatCard>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
                <StatCard>
                    <CardContent>
                        <Typography color="inherit" variant="subtitle2">
                            Products
                        </Typography>
                        <Typography color="inherit" variant="h4">
                            128
                        </Typography>
                        <Typography color="inherit" variant="body2">
                            12 low in stock
                        </Typography>
                    </CardContent>
                </StatCard>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
                <StatCard>
                    <CardContent>
                        <Typography color="inherit" variant="subtitle2">
                            Conversion Rate
                        </Typography>
                        <Typography color="inherit" variant="h4">
                            3.2%
                        </Typography>
                        <Typography color="inherit" variant="body2">
                            +0.8% improvement
                        </Typography>
                    </CardContent>
                </StatCard>
            </Grid>

            {/* Recent Orders */}
            <Grid item xs={12} md={8}>
                <StyledPaper>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                        <Typography variant="h6">Recent Orders</Typography>
                        <Button onClick={() => navigate('/vendor/orders')}>
                            View All
                        </Button>
                    </Box>
                    <List>
                        <ListItem>
                            <ListItemIcon>
                                <CartIcon />
                            </ListItemIcon>
                            <ListItemText
                                primary="Order #1234"
                                secondary="John Doe • £299 • 2 items"
                            />
                            <Chip label="Pending" color="warning" size="small" />
                        </ListItem>
                        <ListItem>
                            <ListItemIcon>
                                <CartIcon />
                            </ListItemIcon>
                            <ListItemText
                                primary="Order #1233"
                                secondary="Jane Smith • £199 • 1 item"
                            />
                            <Chip label="Shipped" color="success" size="small" />
                        </ListItem>
                    </List>
                </StyledPaper>

                <Box mt={3}>
                    <StyledPaper>
                        <Typography variant="h6" gutterBottom>
                            Top Products
                        </Typography>
                        <List>
                            <ListItem>
                                <ListItemIcon>
                                    <TrendingIcon />
                                </ListItemIcon>
                                <ListItemText
                                    primary="Power Tool Set"
                                    secondary="32 sales this month"
                                />
                                <Typography variant="subtitle1" color="primary">
                                    £2,450
                                </Typography>
                            </ListItem>
                        </List>
                    </StyledPaper>
                </Box>
            </Grid>

            {/* Sidebar */}
            <Grid item xs={12} md={4}>
                <StyledPaper>
                    <Typography variant="h6" gutterBottom>
                        Inventory Alerts
                    </Typography>
                    <List>
                        <ListItem>
                            <ListItemIcon>
                                <InventoryIcon color="error" />
                            </ListItemIcon>
                            <ListItemText
                                primary="Power Drill - Black"
                                secondary="Only 2 items left"
                            />
                            <Button size="small" variant="outlined">
                                Restock
                            </Button>
                        </ListItem>
                    </List>
                </StyledPaper>

                <Box mt={3}>
                    <StyledPaper>
                        <Typography variant="h6" gutterBottom>
                            Sales Analytics
                        </Typography>
                        <Box mt={2}>
                            <Box display="flex" justifyContent="space-between" mb={1}>
                                <Typography variant="body2">Monthly Target</Typography>
                                <Typography variant="body2">75%</Typography>
                            </Box>
                            <LinearProgress variant="determinate" value={75} />
                        </Box>
                    </StyledPaper>
                </Box>
            </Grid>
        </Grid>
    );
};

export default VendorDashboard; 