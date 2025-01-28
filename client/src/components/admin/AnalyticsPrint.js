import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const AnalyticsPrint = () => {
    const location = useLocation();
    const data = location.state?.data;

    useEffect(() => {
        if (data) {
            // Auto-trigger print when component mounts
            window.print();
        }
    }, [data]);

    if (!data) return <div>No data available for printing</div>;

    return (
        <div className="analytics-print">
            <h1>Analytics Report</h1>
            <p className="text-muted">Generated on: {new Date().toLocaleDateString()}</p>

            <section className="mb-5">
                <h2>User Growth</h2>
                <table className="table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>New Users</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.userGrowth.map(item => (
                            <tr key={item._id}>
                                <td>{item._id}</td>
                                <td>{item.count}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>

            <section className="mb-5">
                <h2>Revenue Summary</h2>
                <table className="table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Revenue</th>
                            <th>Transactions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.revenue.map(item => (
                            <tr key={item._id}>
                                <td>{item._id}</td>
                                <td>${item.revenue}</td>
                                <td>{item.transactions}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>

            <section className="mb-5">
                <h2>Lead Categories</h2>
                <table className="table">
                    <thead>
                        <tr>
                            <th>Category</th>
                            <th>Count</th>
                            <th>Avg Proposals</th>
                            <th>Total Budget</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.categories.map(item => (
                            <tr key={item._id}>
                                <td>{item._id}</td>
                                <td>{item.count}</td>
                                <td>{item.avgProposals.toFixed(1)}</td>
                                <td>${item.totalBudget}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>

            <section>
                <h2>Conversion Metrics</h2>
                <div className="conversion-summary">
                    <p><strong>Total Leads:</strong> {data.conversion.total}</p>
                    <p><strong>Converted Leads:</strong> {data.conversion.converted}</p>
                    <p><strong>Conversion Rate:</strong> {((data.conversion.converted / data.conversion.total) * 100).toFixed(1)}%</p>
                    <p><strong>Average Time to Convert:</strong> {Math.round(data.conversion.avgTimeToConvert / (1000 * 60 * 60 * 24))} days</p>
                </div>
            </section>
        </div>
    );
};

export default AnalyticsPrint; 