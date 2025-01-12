import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { jobCategories } from '../data/leadCategories.js';

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
            if (response.data && response.data.length > 0) {
                setCategories(response.data);
            } else {
                const formattedCategories = Object.values(jobCategories).map(category => ({
                    _id: category.name.toLowerCase().replace(/\s+/g, '-'),
                    name: category.name,
                    description: category.description,
                    icon: category.icon,
                    subcategories: category.subcategories
                }));
                setCategories(formattedCategories);
            }
            setError(null);
        } catch (err) {
            console.error('Error fetching categories:', err);
            // Fallback to predefined categories
            const formattedCategories = Object.values(jobCategories).map(category => ({
                _id: category.name.toLowerCase().replace(/\s+/g, '-'),
                name: category.name,
                description: category.description,
                icon: category.icon,
                subcategories: category.subcategories
            }));
            setCategories(formattedCategories);
            setError(null);
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