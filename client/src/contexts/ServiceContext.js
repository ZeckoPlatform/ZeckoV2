import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const ServiceContext = createContext();

export const ServiceProvider = ({ children }) => {
    const [categories, setCategories] = useState([]);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/categories');
            setCategories(response.data);
            setError(null);
        } catch (err) {
            setError('Failed to fetch categories');
            console.error('Error fetching categories:', err);
        } finally {
            setLoading(false);
        }
    };

    const createServiceRequest = async (requestData) => {
        try {
            setLoading(true);
            const response = await api.post('/api/requests', requestData);
            setRequests([response.data, ...requests]);
            return response.data;
        } catch (err) {
            setError('Failed to create service request');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const submitQuote = async (requestId, quoteData) => {
        try {
            setLoading(true);
            const response = await api.post(`/api/requests/${requestId}/quote`, quoteData);
            return response.data;
        } catch (err) {
            setError('Failed to submit quote');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    return (
        <ServiceContext.Provider
            value={{
                categories,
                requests,
                loading,
                error,
                fetchCategories,
                createServiceRequest,
                submitQuote
            }}
        >
            {children}
        </ServiceContext.Provider>
    );
};

export const useService = () => {
    const context = useContext(ServiceContext);
    if (!context) {
        throw new Error('useService must be used within a ServiceProvider');
    }
    return context;
}; 