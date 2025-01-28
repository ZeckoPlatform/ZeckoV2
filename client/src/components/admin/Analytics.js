import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  BarChart2, 
  TrendingUp, 
  Users, 
  ShoppingBag, 
  DollarSign 
} from 'react-feather';
import { fetchData, endpoints, getAnalytics } from '../../services/api';
import { useNotification } from '../../contexts/NotificationContext';
import LoadingSpinner from '../common/LoadingSpinner';
import {
    Line,
    Bar,
    Doughnut
} from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

const Container = styled.div`
  padding: 20px;
`;

const ChartGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const ChartContainer = styled.div`
  background: ${({ theme }) => theme.colors.background.paper};
  padding: 20px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  box-shadow: ${({ theme }) => theme.shadows.card};
`;

const Analytics = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [timeframe, setTimeframe] = useState('30');
    const { error: notify } = useNotification();

    useEffect(() => {
        fetchAnalytics();
    }, [timeframe]);

    const fetchAnalytics = async () => {
        try {
            const analyticsData = await getAnalytics(timeframe);
            setData(analyticsData);
        } catch (err) {
            setError('Error loading analytics');
            console.error('Analytics fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        try {
            const response = await fetch(`/api/admin/analytics/export?timeframe=${timeframe}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) throw new Error('Export failed');

            // Create blob from response
            const blob = await response.blob();
            
            // Create download link
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `analytics-${new Date().toISOString()}.xlsx`;
            
            // Trigger download
            document.body.appendChild(a);
            a.click();
            
            // Cleanup
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err) {
            setError('Error exporting analytics');
            console.error('Export error:', err);
        }
    };

    if (loading) return <LoadingSpinner />;
    if (error) return <div className="alert alert-danger">{error}</div>;
    if (!data) return null;

    const userGrowthChart = {
        labels: data.userGrowth.map(item => item._id),
        datasets: [{
            label: 'New Users',
            data: data.userGrowth.map(item => item.count),
            fill: false,
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
        }]
    };

    const revenueChart = {
        labels: data.revenue.map(item => item._id),
        datasets: [{
            label: 'Daily Revenue',
            data: data.revenue.map(item => item.revenue),
            fill: false,
            borderColor: 'rgb(54, 162, 235)',
            tension: 0.1
        }]
    };

    const categoryChart = {
        labels: data.categories.map(item => item._id),
        datasets: [{
            label: 'Leads by Category',
            data: data.categories.map(item => item.count),
            backgroundColor: [
                'rgba(255, 99, 132, 0.5)',
                'rgba(54, 162, 235, 0.5)',
                'rgba(255, 206, 86, 0.5)',
                'rgba(75, 192, 192, 0.5)',
                'rgba(153, 102, 255, 0.5)'
            ]
        }]
    };

    return (
        <div className="analytics">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Analytics Dashboard</h2>
                <div className="d-flex gap-2">
                    <select
                        className="form-select"
                        value={timeframe}
                        onChange={(e) => setTimeframe(e.target.value)}
                    >
                        <option value="7">Last 7 days</option>
                        <option value="30">Last 30 days</option>
                        <option value="90">Last 90 days</option>
                    </select>
                    <button 
                        className="btn btn-primary"
                        onClick={handleExport}
                    >
                        Export Data
                    </button>
                </div>
            </div>

            <div className="row">
                <div className="col-md-6 mb-4">
                    <div className="card">
                        <div className="card-body">
                            <h5 className="card-title">User Growth</h5>
                            <Line data={userGrowthChart} />
                        </div>
                    </div>
                </div>

                <div className="col-md-6 mb-4">
                    <div className="card">
                        <div className="card-body">
                            <h5 className="card-title">Revenue</h5>
                            <Line data={revenueChart} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col-md-6 mb-4">
                    <div className="card">
                        <div className="card-body">
                            <h5 className="card-title">Lead Categories</h5>
                            <Doughnut data={categoryChart} />
                        </div>
                    </div>
                </div>

                <div className="col-md-6 mb-4">
                    <div className="card">
                        <div className="card-body">
                            <h5 className="card-title">Conversion Metrics</h5>
                            <div className="conversion-stats">
                                <div className="stat-item">
                                    <h6>Conversion Rate</h6>
                                    <p className="h3">
                                        {((data.conversion.converted / data.conversion.total) * 100).toFixed(1)}%
                                    </p>
                                </div>
                                <div className="stat-item">
                                    <h6>Avg Time to Convert</h6>
                                    <p className="h3">
                                        {Math.round(data.conversion.avgTimeToConvert / (1000 * 60 * 60 * 24))} days
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col-12">
                    <div className="card">
                        <div className="card-body">
                            <h5 className="card-title">Lead Status Distribution</h5>
                            <Bar
                                data={{
                                    labels: data.leads.map(item => item._id),
                                    datasets: [{
                                        label: 'Number of Leads',
                                        data: data.leads.map(item => item.count),
                                        backgroundColor: 'rgba(75, 192, 192, 0.5)'
                                    }]
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics; 