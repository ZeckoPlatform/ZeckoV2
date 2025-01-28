export const adminDashboardStyles = {
    adminDashboard: {
        padding: '20px'
    },
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
    },
    statCard: {
        backgroundColor: '#fff',
        borderRadius: '8px',
        padding: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    statNumbers: {
        marginTop: '15px'
    },
    statLabel: {
        color: '#666',
        marginRight: '10px'
    },
    statValue: {
        fontWeight: 'bold',
        fontSize: '1.2rem'
    },
    revenueChart: {
        backgroundColor: '#fff',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '30px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    recentTransactions: {
        backgroundColor: '#fff',
        borderRadius: '8px',
        padding: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }
};

export default adminDashboardStyles; 