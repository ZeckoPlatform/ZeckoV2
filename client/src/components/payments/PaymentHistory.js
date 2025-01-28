import { useState, useEffect } from 'react';
import { getPaymentHistory } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import Pagination from '../common/Pagination';

const PaymentHistory = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                const data = await getPaymentHistory(page);
                setPayments(data.payments);
                setTotalPages(data.totalPages);
            } catch (err) {
                setError('Error loading payment history');
                console.error('Payment history error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchPayments();
    }, [page]);

    if (loading) return <LoadingSpinner />;
    if (error) return <div className="alert alert-danger">{error}</div>;

    return (
        <div className="payment-history">
            <h3>Payment History</h3>
            
            {payments.length === 0 ? (
                <p>No payment history found</p>
            ) : (
                <div className="table-responsive">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Description</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th>Invoice</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payments.map((payment) => (
                                <tr key={payment._id}>
                                    <td>{new Date(payment.createdAt).toLocaleDateString()}</td>
                                    <td>{payment.description}</td>
                                    <td>${payment.amount}</td>
                                    <td>
                                        <span className={`badge bg-${payment.status === 'succeeded' ? 'success' : 'danger'}`}>
                                            {payment.status}
                                        </span>
                                    </td>
                                    <td>
                                        {payment.invoiceUrl && (
                                            <a 
                                                href={payment.invoiceUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="btn btn-sm btn-outline-primary"
                                            >
                                                View Invoice
                                            </a>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {totalPages > 1 && (
                <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
                />
            )}
        </div>
    );
};

export default PaymentHistory; 