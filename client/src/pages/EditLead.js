import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { endpoints } from '../services/api';

const EditLead = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [lead, setLead] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLead = async () => {
            try {
                const response = await api.get(`${endpoints.leads.get}/${id}`);
                setLead(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching lead:', error);
                setLoading(false);
            }
        };

        fetchLead();
    }, [id]);

    if (loading) {
        return <div>Loading...</div>;
    }

    // Add your edit form here
    return (
        <div>
            <h1>Edit Lead</h1>
            {/* Add your form components here */}
        </div>
    );
};

export default EditLead; 